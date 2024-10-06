using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.Models
{
    public class Game
    {
        public int Id { get; set; }

        [Required]
        public GameState GameState { get; set; } = GameState.WaitingForPlayers;

        public int CurrentTurn { get; set; }

        public int WinnerId { get; set; }

        public DateTime StartTime { get; set; } = DateTime.UtcNow;

        public DateTime? EndTime { get; set; }

        public List<User> Players { get; set; } = [];

        public List<Message> Messages { get; set; } = [];
        public string? CurrentStateJson { get; set; }
    }
}
