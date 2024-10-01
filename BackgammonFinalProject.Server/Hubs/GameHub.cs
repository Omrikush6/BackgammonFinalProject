using BackgammonFinalProject.Controllers;
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

        public async Task JoinGame(int gameId, int userId)
        {
            try
            {
                var result = await _gameService.JoinGameAsync(gameId, userId);
                if (result.Success)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
                    await Clients.Group(gameId.ToString()).SendAsync("PlayerJoined",GameController.MapGameToDto(result.Game!));
                }
                else
                {
                    throw new HubException(result.Message);
                }
            }
            catch (Exception ex)
            {
                throw new HubException($"An error occurred while joining the game: {ex.Message}");
            }
        }

        public async Task SendMessage(int gameId, int playerId, string messageContent)
        {
            var result = await _gameService.AddMessageAsync(gameId, playerId, messageContent);
            if (result.Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("MessageReceived", result.message);
            }
            else
            {
                await Clients.Caller.SendAsync("MessageError", result.Message);
            }
        }

        // TODO: Implement StartGame and MakeMove methods

    }
}
