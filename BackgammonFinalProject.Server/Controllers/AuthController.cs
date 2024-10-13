using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using BackgammonFinalProject.Server.Repositories;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using BackgammonFinalProject.Server.DTOs;
using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using BackgammonFinalProject.Server.Services;

namespace BackgammonFinalProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IUserRepository userRepository, IConfiguration configuration, HashingService hashingService) : ControllerBase
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IConfiguration _configuration = configuration;
        private readonly HashingService _hashingService = hashingService;

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp(UserDto userDto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(userDto.Username);
            if (existingUser != null)
                return BadRequest("Username already taken.");

            if (string.IsNullOrWhiteSpace(userDto.Email) || !Regex.IsMatch(userDto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return BadRequest("Invalid or missing email.");

            var passwordHash = _hashingService.HashPassword(userDto.Password);

            var user = new User
            {
                Username = userDto.Username,
                Email = userDto.Email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.CreateAsync(user);

            var token = GenerateJwtToken(user);

            Response.Cookies.Append("JWT", token, new CookieOptions { HttpOnly = true });
            return Ok(new { Token = token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDto userDto)
        {
            var user = await _userRepository.GetByUsernameAsync(userDto.Username);
            if (user == null || !_hashingService.VerifyPassword(userDto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            var token = GenerateJwtToken(user);

            Response.Cookies.Append("JWT", token, new CookieOptions { HttpOnly = true });

            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["jwt:Issuer"],
                audience: _configuration["jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: creds
            );
            var generatedToken = new JwtSecurityTokenHandler().WriteToken(token);

            return generatedToken;
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("JWT");
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var token = Request.Cookies["JWT"];
            if (string.IsNullOrEmpty(token))
                return BadRequest("No token provided");

            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

            if (jsonToken == null)
                return BadRequest("Invalid token");

            var username = jsonToken.Claims.First(claim => claim.Type == ClaimTypes.Name).Value;
            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null)
                return BadRequest("User not found");

            var newToken = GenerateJwtToken(user);
            Response.Cookies.Append("JWT", newToken, new CookieOptions { HttpOnly = true });

            return Ok(new { Token = newToken });
        }
    }
}