using BackgammonFinalProject.Models;

namespace BackgammonFinalProject.Server.DTOs
{
    public class GameUpdateDto
    {
        public int CurrentTurn { get; set; }
        public string CurrentStateJson { get; set; }
        public GameState GameState { get; set; }
        public int? WinnerId { get; set; }
    }
}
