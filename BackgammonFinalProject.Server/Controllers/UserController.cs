using BackgammonFinalProject.DTOs;
using BackgammonFinalProject.Models;
using BackgammonFinalProject.Repositories.Interfaces;
using BackgammonFinalProject.Server.Services;
using BackgammonFinalProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BackgammonFinalProj.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly HashingService _hashingService;
        private readonly MappingService _mappingService;

        public UserController(IUserRepository userRepository, HashingService hashingservice, MappingService mappingservice)
        {
            _userRepository = userRepository;
            _hashingService = hashingservice;
            _mappingService = mappingservice;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(_mappingService.MapUserToDto(user));
        }

        [HttpGet("GetUser/{username}")]
        public async Task<IActionResult> GetUserByName(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(_mappingService.MapUserToDto(user));
        }

        [HttpPut("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromBody] UserDto userDto, string password)
        {
            var usernameClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (usernameClaim == null || userIdClaim == null)
                return Unauthorized("Unable to retrieve user information from token.");

            var username = usernameClaim.Value;
            var tokenUserId = int.Parse(userIdClaim.Value);

            if (username != userDto.Username || userDto.Id != tokenUserId)
                return BadRequest("Token mismatch or invalid user ID.");


            var existingUser = await _userRepository.GetByUsernameAsync(username);
            if (existingUser == null)
                return NotFound("User not found.");

            string hashedPassword = _hashingService.HashPassword(password);

            var user = new User
            {
                Id = userDto.Id,
                Username = userDto.Username,
                Email = userDto.Email,
                PasswordHash = hashedPassword
            };

            var result = await _userRepository.UpdateAsync(user);
            if (result)
                return StatusCode(200, "successfully updated user");
            return StatusCode(500, "An error occurred while updating the user.");

        }

        [HttpGet("GetClaims")]
        [Authorize]
        public IActionResult GetClaims()
        {
            if (User == null || User.Claims == null || !User.Claims.Any())
            {
                return NotFound("No claims found on user object.");
            }

            var claimsList = User.Claims.Select(claim => new
            {
                claim.Type,
                claim.Value
            }).ToList();

            return Ok(claimsList);
        }

    }
}
