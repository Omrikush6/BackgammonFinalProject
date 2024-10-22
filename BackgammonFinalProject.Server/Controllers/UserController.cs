using BackgammonFinalProject.Server.DTOs.UserDtos;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using BackgammonFinalProject.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackgammonFinalProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserRepository userRepository, HashingService hashingservice, MappingService mappingservice) : ControllerBase
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly HashingService _hashingService = hashingservice;
        private readonly MappingService _mappingService = mappingservice;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user == null ? NotFound() : Ok(_mappingService.MapUserToDto(user));
        }

        [HttpGet("GetUser/{username}")]
        public async Task<IActionResult> GetUserByName(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            return user == null ? NotFound() : Ok(_mappingService.MapUserToDto(user));
        }

        [HttpPut("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto updateUserDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var existingUser = await _userRepository.GetByIdAsync(userId);

            if (existingUser == null)
                return NotFound("User not found.");

            if (!string.IsNullOrEmpty(updateUserDto.Username))
                existingUser.Username = updateUserDto.Username;

            if (!string.IsNullOrEmpty(updateUserDto.Email))
                existingUser.Email = updateUserDto.Email;

            if (!string.IsNullOrEmpty(updateUserDto.Password))
                existingUser.PasswordHash = _hashingService.HashPassword(updateUserDto.Password);

            var result = await _userRepository.UpdateAsync(existingUser);
            if (result)
                return Ok(_mappingService.MapUserToDto(existingUser));

            return StatusCode(500, "An error occurred while updating the user.");
        }

        [HttpDelete("Delete")]
        public async Task<IActionResult> DeleteUser()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var result = await _userRepository.DeleteAsync(userId);

            return result ? Ok("User deleted successfully") : (IActionResult)StatusCode(500, "An error occurred while deleting the user.");
        }

        [HttpGet("GetClaims")]
        [Authorize]
        public IActionResult GetClaims()
        {
            if (User == null || User.Claims == null || !User.Claims.Any())
                return NotFound("No claims found on user object.");

            var claimsList = User.Claims.Select(claim => new
            {
                claim.Type,
                claim.Value
            }).ToList();

            return Ok(claimsList);
        }

    }
}
