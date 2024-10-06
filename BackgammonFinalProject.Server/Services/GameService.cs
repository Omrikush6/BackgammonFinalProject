using BackgammonFinalProject.DTOs;
using BackgammonFinalProject.Models;
using BackgammonFinalProject.Repositories.Interfaces;
using System.Text.Json;

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
                GameState = GameState.WaitingForPlayers,
                CurrentTurn = player1.Id
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

        public async Task<(bool Success, string Message, Game? Game)> StartGameAsync(int gameId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);
            if (game.Players.Count != 2)
                return (false, "Game cannot start without two players.", null);

            game.GameState = GameState.InProgress;
            game.CurrentTurn = game.Players[Random.Shared.Next(2)].Id;
            game.CurrentStateJson = GenerateInitialGameState();
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
            game.GameState = gameDto.GameState;

            if (gameDto.GameState == GameState.Completed)
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

        private string GenerateInitialGameState()
        {
            //THIS WILL BE UPDATED TO MACTH THE GAME
            // This method should return a JSON string representing the initial game state
            // For example:
            return JsonSerializer.Serialize(new
            {
                board = new int[24], // Represents the initial board setup
                bar = new int[2], // Represents the bar for each player
                off = new int[2], // Represents the off board for each player
                dice = new int[0] // Initially empty, will be filled when dice are rolled
            });
        }

    }

}
