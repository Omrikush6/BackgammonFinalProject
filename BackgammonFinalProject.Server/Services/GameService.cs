using BackgammonFinalProject.Models;
using BackgammonFinalProject.Repositories.Interfaces;

namespace BackgammonFinalProject.Services
{
    public class GameService
    {
        private readonly IGameRepository _gameRepository;
        private readonly IUserRepository _userRepository;

        public GameService(IGameRepository gameRepository, IUserRepository userRepository)
        {
            _gameRepository = gameRepository;
            _userRepository = userRepository;
        }

        public async Task<Game> CreateGameAsync(User player1)
        {
            var newGame = new Game
            {
                StartTime = DateTime.UtcNow,
                Players = [player1],
                GameState = GameState.WaitingForPlayers
            };
            await _gameRepository.CreateAsync(newGame);
            return newGame;
        }

        public async Task<Game?> GetGameByIdAsync(int gameId) => await _gameRepository.GetByIdAsync(gameId);

        public async Task<List<Game>> GetAllGamesAsync() => await _gameRepository.GetActiveGamesAsync();

        public async Task<(bool Success, string Message, Game? Game)> JoinGameAsync(int gameId, int userId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            var player = await _userRepository.GetByIdAsync(userId);
            if (player == null)
                return (false, "User not found.", null);

            if (game.Players.Count >= 2)
                return (false, "Game is full.", null);

            game.Players.Add(player);
            if (game.Players.Count == 2)
            {
                game.GameState = GameState.ReadyToStart;
            }

            await _gameRepository.UpdateAsync(game);
            return (true, "Player joined successfully.", game);
        }

        public async Task<Game> StartGameAsync(int gameId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                throw new Exception("Game not found");

            if (game.GameState != GameState.InProgress)
                throw new Exception("Game is not ready to start");

            game.GameState = GameState.InProgress;
            game.CurrentTurn = game.Players[0].Id;
            await _gameRepository.UpdateAsync(game);
            return game;
        }

        public async Task<(bool Success, string Message, Game? Game)> MakeMoveAsync(int gameId, int playerId, string move)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            if (game.CurrentTurn != playerId)
                return (false, "It's not this player's turn.", null);

            // Parse and validate move
            if (!TryParseMove(move, out int fromPosition, out int toPosition))
                return (false, "Invalid move format.", null);

            if (!ValidateMove(game, playerId, fromPosition, toPosition))
                return (false, "Invalid move.", null);

            ApplyMove(game, fromPosition, toPosition);

            if (CheckWinner(game))
            {
                game.GameState = GameState.Completed;
                game.EndTime = DateTime.UtcNow;
            }
            else
            {
                game.CurrentTurn = GetNextPlayer(game, playerId);
            }

            await _gameRepository.UpdateAsync(game);
            return (true, "Move applied successfully.", game);
        }

        public async Task<(bool Success, string Message, Message? message)> AddMessageAsync(int gameId, int playerId, string messageContent)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            var player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
                return (false, "Player not found in game.", null);

            var message = new Message
            {
                Content = messageContent,
                Timestamp = DateTime.UtcNow,
                Sender = player
            };
            game.Messages.Add(message);

            await _gameRepository.UpdateAsync(game);
            return (true, "Message added successfully.", message);
        }

        private bool TryParseMove(string move, out int fromPosition, out int toPosition)
        {
            fromPosition = toPosition = 0;
            var moveParts = move.Split(' ');
            if (moveParts.Length != 2) return false;

            return int.TryParse(moveParts[0].Split(':')[1], out fromPosition) &&
                   int.TryParse(moveParts[1].Split(':')[1], out toPosition);
        }

        private bool ValidateMove(Game game, int playerId, int fromPosition, int toPosition)
        {
            // Implement move validation based on Backgammon rules
            // This is a placeholder and should be replaced with actual game logic
            return true;
        }

        private void ApplyMove(Game game, int fromPosition, int toPosition)
        {
            // Implement logic to update game state based on the move
            // This should update the board state, handle captures, etc.
            Console.WriteLine($"Move applied from {fromPosition} to {toPosition}");
        }

        private bool CheckWinner(Game game)
        {
            // Implement logic to check if the current game state results in a winner
            // This should check if any player has moved all their pieces off the board
            return false;
        }

        private int GetNextPlayer(Game game, int currentPlayerId)
        {
            var currentPlayerIndex = game.Players.FindIndex(p => p.Id == currentPlayerId);
            var nextPlayerIndex = (currentPlayerIndex + 1) % game.Players.Count;
            return game.Players[nextPlayerIndex].Id;
        }
    }

}
