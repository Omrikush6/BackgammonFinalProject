using BackgammonFinalProject.Server.Models;
using BackgammonFinalProject.Server.DTOs.UserDtos;
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
        public DrawOfferStatus DrawOfferStatus { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public HashSet<UserDto> Players { get; set; } = [];
        public int? WhitePlayerId { get; set; }
        public int? BlackPlayerId { get; set; }
        public List<MessageDto> Messages { get; set; } = [];
        public Point[] Points { get; set; } = Enumerable.Range(0, 24).Select(_ => new Point { PlayerColor = null, Checkers = 0 }).ToArray();
        public int BarWhite { get; set; }
        public int BarBlack { get; set; }
        public int OutsideBarWhite { get; set; }
        public int OutsideBarBlack { get; set; }
        public int[] DiceValues { get; set; } = [];
        public bool IsRolled { get; set; }
    }



}