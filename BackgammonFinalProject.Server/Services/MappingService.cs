﻿using BackgammonFinalProject.Server.DTOs;
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
                PlayerIds = game.Players?.Select(p => p.Id).ToHashSet() ?? [],
                Messages = game.Messages?.Select(m => new MessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    Timestamp = m.Timestamp,
                    SenderId = m.Sender?.Id ?? 0,
                    SenderName = m.Sender!.Username
                }).ToList() ?? [],
                CurrentStateJson = game.CurrentStateJson
                
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
                GameIds = user.Games.Select(game => game.Id).ToList()
            };
        }
        public MessageDto MapMessageToDto(Message message)
        {
            return new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                Timestamp = message.Timestamp,
                SenderId = message.Sender?.Id ?? 0,
                SenderName = message.Sender!.Username
            };
        }
    }
}
