using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
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

        public async Task<(bool Success, string Message, Game? Game)> ForfeitGameAsync(int gameId, int forfeitingPlayerId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null);
            var winnerId = forfeitingPlayerId == game.WhitePlayerId ? game.BlackPlayerId : game.WhitePlayerId;
            game.GameStatus = GameStatus.Completed;
            game.WinnerId = winnerId;
            game.EndTime = DateTime.UtcNow;

            await _gameRepository.UpdateAsync(game);
            return (true, "Player forfeited. Game ended.", game);
        }
        public async Task<(bool Success, string Message, int? Recipient)> OfferDrawAsync(int gameId, int userId)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.",null);

            //if (game.DrawOfferedBy == userId)
            //    return (false, "Draw Offerd by player",null);

            if (game.GameStatus != GameStatus.InProgress)
                return (false, "Draw Offerd by player",null);

            if (userId != game.WhitePlayerId && userId != game.BlackPlayerId)
                return (false,"Only game participants can offer a draw",null);

            if (game.DrawOfferStatus == DrawOfferStatus.Pending)
                return (false, "draw already offered",null);

            game.DrawOfferedBy = userId;
            game.DrawOfferStatus = DrawOfferStatus.Pending;
            var recipientId = userId == game.WhitePlayerId
                 ? game.BlackPlayerId
                 : game.WhitePlayerId;
            await _gameRepository.UpdateAsync(game);
            return (true,"draw offered", recipientId);
        }

        public async Task<(bool Success, string Message, int? UserId, bool Accepted)> RespondToDrawAsync(int gameId, int userId, bool accept)
        {
            var game = await _gameRepository.GetByIdAsync(gameId);
            if (game == null)
                return (false, "Game not found.", null, false);

            // Validate draw offer state
            if (game.DrawOfferStatus != DrawOfferStatus.Pending)
                return (false, "No pending draw offer.", null, false);

            // Ensure the responding user is the other player
            if (userId == game.DrawOfferedBy)
                return (false, "Cannot respond to own draw offer.", null, false);

            // Validate game is still in progress
            if (game.GameStatus != GameStatus.InProgress)
                return (false, "Game is not in progress.", null, false);

            if (accept)
            {
                // End the game as a draw
                game.GameStatus = GameStatus.Completed;
                game.EndTime = DateTime.UtcNow;
                game.WinnerId = null; // Indicates a draw
                game.DrawOfferStatus = DrawOfferStatus.Accepted;
            }
            else
            {
                // Reject the draw offer
                game.DrawOfferStatus = DrawOfferStatus.Rejected;
                game.DrawOfferedBy = null;
            }

            // Update the game state
            await _gameRepository.UpdateAsync(game);

            return (true, accept ? "Draw accepted" : "Draw rejected", userId, accept);
        }

    }

}
