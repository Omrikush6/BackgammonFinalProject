using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.Server.DTOs
{
    public class MessageDto
    {
        [StringLength(500, ErrorMessage = "Message content cannot exceed 500 characters.")]
        public string Content { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; }

        public string? SenderName { get; set; }
    }
}
