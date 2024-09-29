using System.ComponentModel.DataAnnotations.Schema;
using BackgammonFinalProject.Models;

namespace BackgammonFinalProject.Models
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
