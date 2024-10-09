using System.ComponentModel.DataAnnotations.Schema;

namespace BackgammonFinalProject.Server.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public User? Sender { get; set; }
        public int GameId { get; set; }
        public Game? Game { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
