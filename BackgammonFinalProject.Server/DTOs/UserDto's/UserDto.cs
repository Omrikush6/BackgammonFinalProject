using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.Server.DTOs.UserDtos {
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<int> GameIds { get; set; } = [];
    }

}
