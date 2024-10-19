using BackgammonFinalProject.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace BackgammonFinalProject.Server.DTOs
{
    public class GameDto
    {
        public int Id { get; set; }

        public GameStatus GameStatus { get; set; }
        public int? CurrentTurn { get; set; }
        public int? WinnerId { get; set; }
        public int? DrawOfferedBy { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public HashSet<PlayerDto> Players { get; set; } = [];
        public int? WhitePlayerId { get; set; }
        public int? BlackPlayerId { get; set; }
        public List<MessageDto> Messages { get; set; } = [];
        public Point[] Points { get; set; } = new Point[24];
        public int BarWhite { get; set; }
        public int BarBlack { get; set; }
        public int OutsideBarWhite { get; set; }
        public int OutsideBarBlack { get; set; }
        public int[] DiceValues { get; set; } = [];
        public bool IsRolled { get; set; }
    }



}