using BackgammonFinalProject.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.Server.DTOs
{
    public class GameDto
    {
        public int Id { get; set; }

        public GameStatus GameStatus { get; set; }

        public int CurrentTurn { get; set; }

        public int? WinnerId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public HashSet<int> PlayerIds { get; set; } = [];

        public List<MessageDto> Messages { get; set; } = [];
        public string? CurrentStateJson { get; set; }
    }
}