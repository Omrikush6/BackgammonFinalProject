using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.DTOs.UserDtos;
using BackgammonFinalProject.Server.Models;

namespace BackgammonFinalProject.Server.Services
{
    public class MappingService
    {
        public GameDto MapGameToDto(Game game)
        {
            return new GameDto
            {
                Id = game.Id,
                GameStatus = game.GameStatus,
                CurrentTurn = game.CurrentTurn,
                WinnerId = game.WinnerId,
                StartTime = game.StartTime,
                EndTime = game.EndTime,
                Players = game.Players?.Select(MapUserToDto).ToHashSet() ?? [],
                BlackPlayerId = game.BlackPlayerId,
                WhitePlayerId = game.WhitePlayerId,
                Messages = game.Messages?.Select(MapMessageToDto).ToList() ?? [], 
                BarBlack = game.BarBlack,
                BarWhite = game.BarWhite,
                OutsideBarBlack = game.OutsideBarBlack,
                OutsideBarWhite = game.OutsideBarWhite,
                DiceValues = game.DiceValues,
                IsRolled = game.IsRolled,
                Points = game.Points,
            };
        }

        public UserDto MapUserToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                GameIds = user.Games?.Select(g => g.Id).ToList() ?? [] 
            };
        }

        public MessageDto MapMessageToDto(Message message)
        {
            return new MessageDto
            {
                Content = message.Content,
                Timestamp = message.Timestamp,
                SenderName = message.Sender?.Username ?? "Unknown" 
            };
        }
    }

}
