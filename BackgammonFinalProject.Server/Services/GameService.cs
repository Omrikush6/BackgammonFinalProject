using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using System.Numerics;
using System.Text.Json;

namespace BackgammonFinalProject.Server.Services
{
    public class GameService(IGameRepository gameRepository, IUserRepository userRepository, GameLogic gamelogic)
    {
        private readonly IGameRepository _gameRepository = gameRepository;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly GameLogic _gameLogic = gamelogic;

        public async Task<Game> CreateGameAsync(User user)
        {
            var game = new Game
            {
                Players = [user],
                GameStatus = GameStatus.WaitingForPlayers
            };
            await _gameRepository.CreateAsync(game);
            return game;
        }

        public async Task<Game?> GetGameByIdAsync(int gameId) => await _gameRepository.GetByIdAsync(gameId);

        public async Task<List<Game>> GetAllGamesAsync() => await _gameRepository.GetActiveGamesAsync();

        public async Task<(bool Success, string Message, Game? Game)> JoinGameAsync(int gameId, int userId)
        {
            Game? game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            User? user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return (false, "User not found.", null);

            if (game.Players.Any(p => p.Id == userId))
                return (true, "Player already in the game.", game);

            if (game.Players.Count >= 2)
                return (false, "Game is full.", null);

            game.Players.Add(user);
            if (game.Players.Count == 2)
                game.GameStatus = GameStatus.ReadyToStart;

            await _gameRepository.UpdateAsync(game);
            return (true, "Player joined successfully.", game);
        }

        public async Task<(bool Success, string Message, Game? Game)> StartGameAsync(int gameId)
        {
            Game? game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);
            if (game.Players.Count != 2)
                return (false, "Game cannot start without two players.", null);
            _gameLogic.InitializeGame(game);
            await _gameRepository.UpdateAsync(game);
            return (true, "Game started successfully.", game);
        }

        public async Task<(bool Success, string Message, Game? Game)> UpdateGameAsync(int gameId, GameDto gameDto)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            game.CurrentTurn = gameDto.CurrentTurn;
            game.DiceValues = gameDto.DiceValues;
            game.Points = gameDto.Points;
            game.BarBlack = gameDto.BarBlack;
            game.BarWhite = gameDto.BarWhite;
            game.OutsideBarWhite = gameDto.OutsideBarWhite;
            game.OutsideBarBlack = gameDto.OutsideBarBlack;
            game.GameStatus = gameDto.GameStatus;

            await _gameRepository.UpdateAsync(game);
            return (true, "Game updated successfully.", game);
        }

        public async Task<(bool Success, string Message, Game? Game)> RollDiceAsync(int gameId, int userId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            var (Success, Message) = _gameLogic.RollDice(game, userId);

            if (Success)
            {
                await _gameRepository.UpdateAsync(game);
            }

            return (Success, Message, game);
        }

        public async Task<(bool Success, string Message, Game? Game)> MoveCheckerAsync(int gameId, int userId, string from, string to)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            var (Success, Message) = _gameLogic.MoveChecker(game, userId, from, to);

            if (Success)
            {
                await _gameRepository.UpdateAsync(game);
            }

            return (Success, Message, game);
        }

        public async Task<(bool Success, string Message, Message? message)> AddMessageAsync(int gameId, int playerId, string messageContent)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);

            var user = await _userRepository.GetByIdAsync(playerId);
            if (user == null)
                return (false, "User not found.", null);

            var message = new Message
            {
                Content = messageContent,
                Timestamp = DateTime.UtcNow,
                Sender = user
            };
            game.Messages.Add(message);
            await _gameRepository.UpdateAsync(game);
            return (true, "Message added successfully.", message);
        }

        public async Task<(bool Success, string Message, Game? Game)> EndGameAsync(int gameId, int winnerId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);
            game.GameStatus = GameStatus.Completed;
            game.EndTime = DateTime.UtcNow;
            game.WinnerId = winnerId;
            await _gameRepository.UpdateAsync(game);
            return (true, "Game ended successfully.", game);
        }

    }

}
