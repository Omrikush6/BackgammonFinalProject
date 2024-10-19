using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.Server.DTOs.UserDtos
{
    public class LoginDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters.")]

        public string Username { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one digit.")]
        public string Password { get; set; } = string.Empty;
    }
}
