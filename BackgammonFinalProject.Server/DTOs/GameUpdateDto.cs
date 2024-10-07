using BackgammonFinalProject.Server.Models;

namespace BackgammonFinalProject.Server.DTOs
{
    public class GameUpdateDto
    {
        public int CurrentTurn { get; set; }
        public required string CurrentStateJson { get; set; }
        public GameState GameState { get; set; }
        public int? WinnerId { get; set; }
    }
}
