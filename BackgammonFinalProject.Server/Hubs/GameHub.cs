using BackgammonFinalProject.Controllers;
using BackgammonFinalProject.DTOs;
using BackgammonFinalProject.Models;
using BackgammonFinalProject.Server.Services;
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
        private readonly MappingService _mappingService;

        public GameHub(GameService gameService, MappingService mappingService)
        {
            _gameService = gameService;
            _mappingService = mappingService;
        }

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
                    throw new HubException(result.Message);
                }
            }
            catch (Exception ex)
            {
                throw new HubException($"An error occurred while joining the game: {ex.Message}");
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
