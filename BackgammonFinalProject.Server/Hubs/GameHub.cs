using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Services;
using Microsoft.AspNetCore.SignalR;

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
                var (Success, Message, Game) = await _gameService.JoinGameAsync(gameId, userId);
                if (Success)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
                    await Clients.Group(gameId.ToString()).SendAsync("PlayerJoined", _mappingService.MapGameToDto(Game!));
                }
                else
                {
                    await Clients.Caller.SendAsync("JoinGameError", Message);
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("JoinGameError", $"An error occurred while joining the game: {ex.Message}");
            }
        }

        public async Task StartGame(int gameId)
        {
            var (Success, Message, Game) = await _gameService.StartGameAsync(gameId);
            if (Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("GameStarted", _mappingService.MapGameToDto(Game!));
            }
            else
            {
                throw new HubException(Message);
            }
        }

        public async Task UpdateGame(int gameId, GameDto gameDto)
        {
            var (Success, Message, Game) = await _gameService.UpdateGameAsync(gameId, gameDto);
            if (Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("GameUpdated", _mappingService.MapGameToDto(Game!));
            }
            else
            {
                throw new HubException(Message);
            }
        }

        public async Task SendMessage(int gameId, int playerId, string messageContent)
        {
            var (Success, Message, message) = await _gameService.AddMessageAsync(gameId, playerId, messageContent);
            if (Success)
            {
                await Clients.Group(gameId.ToString()).SendAsync("MessageReceived", _mappingService.MapMessageToDto(message!));
            }
            else
            {
                await Clients.Caller.SendAsync("MessageError", Message);
            }
        }
    }
}
