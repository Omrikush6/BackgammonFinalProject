using BackgammonFinalProject.Server.Controllers;
using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackgammonFinalProject.Server.Hubs
{
    public class GameHub(GameService gameService, MappingService mappingService) : Hub
    {
        private readonly GameService _gameService = gameService;
        private readonly MappingService _mappingService = mappingService;

        public async Task JoinGame(int gameId, int userId)
        {
            try
            {
                var result = await _gameService.JoinGameAsync(gameId, userId);
                if (result.Success)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
                    await Clients.Group(gameId.ToString()).SendAsync("PlayerJoined", _mappingService.MapGameToDto(result.Game!));
                }
                else
                {
                    await Clients.Caller.SendAsync("JoinGameError", result.Message);
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("JoinGameError", $"An error occurred while joining the game: {ex.Message}");
            }
        }

        public async Task StartGame(int gameId)
        {
            var result = await _gameService.StartGameAsync(gameId);
            if (result.Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("GameStarted", _mappingService.MapGameToDto(result.Game!));
            }
            else
            {
                throw new HubException(result.Message);
            }
        }

        public async Task UpdateGame(int gameId, GameDto gameDto)
        {
            var result = await _gameService.UpdateGameAsync(gameId, gameDto);
            if (result.Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("GameUpdated", _mappingService.MapGameToDto(result.Game!));
            }
            else
            {
                throw new HubException(result.Message);
            }
        }

        public async Task SendMessage(int gameId, int playerId, string messageContent)
        {
            var result = await _gameService.AddMessageAsync(gameId, playerId, messageContent);
            if (result.Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("MessageReceived", _mappingService.MapMessageToDto(result.message!));
            }
            else
            {
                await Clients.Caller.SendAsync("MessageError", result.Message);
            }
        }
    }
}
