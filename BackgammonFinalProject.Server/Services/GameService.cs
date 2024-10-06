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

    }

}
