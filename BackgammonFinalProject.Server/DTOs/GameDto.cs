using BackgammonFinalProject.Models;
using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.DTOs
{
    public class GameDto
    {
        public int Id { get; set; }

        public GameState GameState { get; set; }

        public int CurrentTurn { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public List<int> PlayerIds { get; set; } = new List<int>();

        public List<MessageDto> Messages { get; set; } = new List<MessageDto>();
    }
}
