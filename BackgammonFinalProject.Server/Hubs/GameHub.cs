using BackgammonFinalProject.Models;
using BackgammonFinalProject.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackgammonFinalProject.Hubs
{
    public class GameHub : Hub
    {
        private readonly GameService _gameService;

        public GameHub(GameService gameService) => _gameService = gameService;

        public async Task JoinGame(int gameId)
        {
            var game = _gameService.GetGameByIdAsync(gameId);
            if (game == null)
                throw new Exception("Game not found");

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
            await Clients.Group(gameId.ToString()).SendAsync("PlayerJoined", game);
        }

        public async Task MakeMove(int gameId, int playerId, string move)
        {
            var result = await _gameService.MakeMoveAsync(gameId, playerId, move);
            if (result.Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("MoveMade", result.Game);
            }
            else
            {
                await Clients.Caller.SendAsync("MoveError", result.Message);
            }
        }

        public async Task SendMessage(int gameId, int playerId, string messageContent)
        {
            var result = await _gameService.AddMessageAsync(gameId, playerId, messageContent);
            if (result.Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("MessageReceived", result.Message);
            }
            else
            {
                await Clients.Caller.SendAsync("MessageError", result.Message);
            }
        }
    }
}
