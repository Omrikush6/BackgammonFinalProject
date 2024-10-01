﻿using BackgammonFinalProject.DTOs;
using BackgammonFinalProject.Models;
using BackgammonFinalProject.Repositories.Interfaces;
using BackgammonFinalProject.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BackgammonFinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly GameService _gameService;
        private readonly IUserRepository _userRepository;

        public GameController(GameService gameService, IUserRepository userRepository)
        {
            _gameService = gameService;
            _userRepository = userRepository;
        }

        [HttpPost("CreateGame")]
        public async Task<ActionResult<GameDto>> CreateGame()
        {
            var playerId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (playerId == null) { return NotFound($"User with ID {playerId} not found."); }

            var player = await _userRepository.GetByIdAsync(int.Parse(playerId.Value));
            if (player == null)
                return NotFound($"User with ID {playerId} not found.");

            var newGame = await _gameService.CreateGameAsync(player);
            return Ok(MapGameToDto(newGame));
        }

        [HttpPost("JoinGame/{gameId}")]
        public async Task<ActionResult<GameDto>> JoinGame(int gameId, [FromBody] int userId)
        {
            var result = await _gameService.JoinGameAsync(gameId, userId);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }
            return Ok(MapGameToDto(result.Game!));
        }

        [HttpGet("{gameId}")]
        public async Task<ActionResult<GameDto>> GetGame(int gameId)
        {
            var game = await _gameService.GetGameByIdAsync(gameId);
            if (game == null)
            {
                return NotFound("Game not found.");
            }
            return Ok(MapGameToDto(game));
        }

        [HttpGet("AllGames")]
        public async Task<ActionResult<List<GameDto>>> GetAllGames()
        {
            var games = await _gameService.GetAllGamesAsync();
            var gameDtos = games.Select(MapGameToDto).ToList();
            return Ok(gameDtos);
        }

        //TODO create startgame method

        public static GameDto MapGameToDto(Game game)
        {
            return new GameDto
            {
                Id = game.Id,
                GameState = game.GameState,
                CurrentTurn = game.CurrentTurn,
                StartTime = game.StartTime,
                EndTime = game.EndTime,
                PlayerIds = game.Players?.Select(p => p.Id).ToList() ?? new List<int>(),
                Messages = game.Messages?.Select(m => new MessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    Timestamp = m.Timestamp,
                    SenderId = m.Sender?.Id ?? 0
                }).ToList() ?? new List<MessageDto>()
            };
        }
    }
}
