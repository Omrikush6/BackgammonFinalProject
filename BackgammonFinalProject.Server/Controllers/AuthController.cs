using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.Repositories.Interfaces;
using BackgammonFinalProject.Server.Services;
using BackgammonFinalProject.Server.DTOs.UserDtos;
using Microsoft.AspNetCore.Identity.Data;

namespace BackgammonFinalProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IUserRepository userRepository, IConfiguration configuration, HashingService hashingService, EmailService emailService) : ControllerBase
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IConfiguration _configuration = configuration;
        private readonly HashingService _hashingService = hashingService;
        private readonly EmailService emailService = emailService;


        [HttpPost("signup")]
        public async Task<IActionResult> SignUp(SignUpDto signUpDto)
        {
            User? existingUser = await _userRepository.GetByUsernameOrEmailAsync(signUpDto.Username, signUpDto.Email);
            if (existingUser != null)
            {
                return existingUser.Username.Equals(signUpDto.Username, StringComparison.OrdinalIgnoreCase)
                    ? BadRequest("Username already taken.")
                    : (IActionResult)BadRequest("Email already taken.");
            }

            string passwordHash = _hashingService.HashPassword(signUpDto.Password);

            User user = new()
            {
                Username = signUpDto.Username,
                Email = signUpDto.Email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.CreateAsync(user);

            var token = GenerateJwtToken(user);

            Response.Cookies.Append("JWT", token, new CookieOptions { HttpOnly = true });
            return Ok(new { Token = token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            User? user = await _userRepository.GetByUsernameAsync(loginDto.Username);
            if (user == null || !_hashingService.VerifyPassword(loginDto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            string token = GenerateJwtToken(user);

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

            JwtSecurityTokenHandler handler = new();

            if (handler.ReadToken(token) is not JwtSecurityToken jsonToken)
                return BadRequest("Invalid token");

            var username = jsonToken.Claims.First(claim => claim.Type == ClaimTypes.Name).Value;
            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null)
                return BadRequest("User not found");

            var newToken = GenerateJwtToken(user);
            Response.Cookies.Append("JWT", newToken, new CookieOptions { HttpOnly = true });

            return Ok(new { Token = newToken });
        }

        //[HttpPost("forgot-password")]
        //public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        //{
        //    try
        //    {
        //        var user = await _userRepository.GetByEmailAsync(request.Email);
        //        if (user == null)
        //        {
        //            // Return success even if email doesn't exist to prevent email enumeration
        //            return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        //        }

        //        // Generate password reset token
        //        var resetToken = await _userRepository.GeneratePasswordResetTokenAsync(user);

        //        // Create reset link
        //        var resetLink = $"{_configuration["AppSettings:ClientBaseUrl"]}/reset-password?token={resetToken}";

        //        // Send email
        //        var emailContent = $@"
        //        <h2>Password Reset Request</h2>
        //        <p>Click the link below to reset your password:</p>
        //        <a href='{resetLink}'>Reset Password</a>
        //        <p>If you didn't request this, please ignore this email.</p>
        //        <p>This link will expire in 1 hour.</p>";

        //        await _emailService.SendEmailAsync(
        //            request.Email,
        //            "Password Reset Request",
        //            emailContent
        //        );

        //        return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "An error occurred while processing your request." });
        //    }
        //}

        //[HttpPost("reset-password")]
        //public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        //{
        //    try
        //    {
        //        var result = await _userRepository.ResetPasswordAsync(request.Token, request.NewPassword);
        //        if (result)
        //        {
        //            return Ok(new { message = "Password has been reset successfully." });
        //        }

        //        return BadRequest(new { message = "Invalid or expired token." });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "An error occurred while resetting your password." });
        //    }
        //}
    }
}