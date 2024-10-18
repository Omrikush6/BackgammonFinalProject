using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using System.Numerics;
using System.Text.Json;

namespace BackgammonFinalProject.Server.Services
{
    public class GameService(IGameRepository gameRepository, IUserRepository userRepository)
    {
        private readonly IGameRepository _gameRepository = gameRepository;
        private readonly IUserRepository _userRepository = userRepository;

        public async Task<Game> CreateGameAsync(User player1)
        {
            var newGame = new Game
            {
                Players = [player1],
                GameStatus = GameStatus.WaitingForPlayers
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

            if (game.Players.Any(p => p.Id == userId))
                return (true, "Player already in the game.", game);

            if (game.Players.Count >= 2)
                return (false, "Game is full.", null);

            game.Players.Add(player);

            if (game.Players.Count == 2)
                game.GameStatus = GameStatus.ReadyToStart;

            await _gameRepository.UpdateAsync(game);
            return (true, "Player joined successfully.", game);
        }

        public async Task<(bool Success, string Message, Game? Game)> StartGameAsync(int gameId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);
            if (game.Players.Count != 2)
                return (false, "Game cannot start without two players.", null);

            game.GameStatus = GameStatus.InProgress;
            game.CurrentTurn = game.Players.OrderBy(_ => Guid.NewGuid()).First().Id;
            game.CurrentStateJson = GenerateInitialGameState(game.Players.ToList(), game.CurrentTurn);
            await _gameRepository.UpdateAsync(game);
            return (true, "Game started successfully.", game);
        }

        public async Task<(bool Success, string Message, Game? Game)> UpdateGameAsync(int gameId, GameDto gameDto)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            game.CurrentTurn = gameDto.CurrentTurn;
            game.CurrentStateJson = gameDto.CurrentStateJson;
            game.GameStatus = gameDto.GameStatus;

            if (gameDto.GameStatus == GameStatus.Completed)
            {
                game.WinnerId = (int)gameDto.WinnerId!;
                game.EndTime = DateTime.UtcNow;
            }

            await _gameRepository.UpdateAsync(game);
            return (true, "Game updated successfully.", game);
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

        private static string GenerateInitialGameState(List<User> players, int startingPlayerId)
        {
            var whitePlayer = players.First(p => p.Id == startingPlayerId);
            var blackPlayer = players.First(p => p.Id != startingPlayerId);

            var initialState = new
            {
                points = new[]
                {
                    new { player = "white", checkers = 2 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = "black", checkers = 5 },
                    new { player = (string)null, checkers = 0 },
                    new { player = "black", checkers = 3 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = "white", checkers = 5 },
                    new { player = "black", checkers = 5 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = "white", checkers = 3 },
                    new { player = (string)null, checkers = 0 },
                    new { player = "white", checkers = 5 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = (string)null, checkers = 0 },
                    new { player = "black", checkers = 2 }
                },
                barWhite = 0,
                barBlack = 0,
                outsideBarWhite = 0,
                outsideBarBlack = 0,
                diceValues = new int[] { 0, 0 },
                isRolled = false,
                players = new
                {
                    white = new { id = whitePlayer.Id },
                    black = new { id = blackPlayer.Id }
                }
            };

            return JsonSerializer.Serialize(initialState);
        }

        public async Task<(bool Success, string Message, Game? Game)> EndGameAsync(int gameId, int winnerId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            game.GameStatus = GameStatus.Completed;
            game.EndTime = DateTime.UtcNow;

            var currentState = JsonSerializer.Deserialize<Dictionary<string, object>>(game.CurrentStateJson!);
            currentState!["gameStatus"] = GameStatus.Completed;
            currentState["winnerId"] = winnerId;
            game.CurrentStateJson = JsonSerializer.Serialize(currentState);

            await _gameRepository.UpdateAsync(game);
            return (true, "Game ended successfully.", game);
        }

    }

}
