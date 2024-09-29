using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.DTOs
{
    public class MessageDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Message content cannot exceed 500 characters.")]
        public string Content { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        public int SenderId { get; set; }
    }
}
