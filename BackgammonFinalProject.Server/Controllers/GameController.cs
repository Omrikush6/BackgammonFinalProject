﻿using BackgammonFinalProject.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using BackgammonFinalProject.Server.Models;

namespace BackgammonFinalProject.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GameController(GameService gameService, IUserRepository userRepository, MappingService mappingService) : ControllerBase
    {
        private readonly GameService _gameService = gameService;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly MappingService _mappingService = mappingService;

        [HttpPost("CreateGame")]
        public async Task<ActionResult<GameDto>> CreateGame()
        {
            try
            {
                var playerId = (User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value) as string;
                if (string.IsNullOrEmpty(playerId))
                    return Unauthorized("User not authenticated or user ID not found.");

                var player = await _userRepository.GetByIdAsync(int.Parse(playerId));
                if (player == null)
                    return NotFound($"User with ID {playerId} not found.");

                var newGame = await _gameService.CreateGameAsync(player);
                return Ok(newGame.Id);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating game: {ex.Message}");
            }
        }

        [HttpPost("JoinGame/{gameId}")]
        public async Task<ActionResult<GameDto>> JoinGame(int gameId)
        {
            try
            {
                var playerId = (User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value) as string;
                if (string.IsNullOrEmpty(playerId))
                    return Unauthorized("User not authenticated or user ID not found.");


                var userId = int.Parse(playerId);
                var result = await _gameService.JoinGameAsync(gameId, userId);
                return Ok(result.Game!.Id);

            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating game: {ex.Message}");
            }
        }

        [HttpGet("{gameId}")]
        public async Task<ActionResult<GameDto>> GetGame(int gameId)
        {
            if (await _gameService.GetGameByIdAsync(gameId) is Game game)
                return Ok(_mappingService.MapGameToDto(game));
            return NotFound("Game not found.");

        }

        [HttpGet("AllGames")]
        public async Task<ActionResult<List<GameDto>>> GetAllGames()
        {
            var games = await _gameService.GetAllGamesAsync();
            return Ok(games.Select(_mappingService.MapGameToDto).ToList());
        }
    }
}