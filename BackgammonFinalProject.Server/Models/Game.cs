﻿using BackgammonFinalProject.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Drawing;
using System.Text.Json;

namespace BackgammonFinalProject.Server.Models
{
    public class Game
    {
        public int Id { get; set; }

        [Required]
        public GameStatus GameStatus { get; set; } = GameStatus.WaitingForPlayers;
        public int? CurrentTurn { get; set; }
        public int? WinnerId { get; set; }
        public int? DrawOfferedBy { get; set; }
        public DrawOfferStatus DrawOfferStatus { get; set; }
        public DateTime? StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }
        public HashSet<User> Players { get; set; } = [];
        public int? WhitePlayerId { get; set; }
        public int? BlackPlayerId { get; set; }
        public List<Message> Messages { get; set; } = [];
        [NotMapped]
        public Point[] Points { get; set; } = Enumerable.Range(0, 24).Select(_ => new Point { PlayerColor = null, Checkers = 0 }).ToArray();
        public string PointsJson
        {
            get => JsonSerializer.Serialize(Points);
            set => Points = JsonSerializer.Deserialize<Point[]>(value) ?? Enumerable.Range(0, 24).Select(_ => new Point { PlayerColor = null, Checkers = 0 }).ToArray();
        }
        public int BarWhite { get; set; }
        public int BarBlack { get; set; }
        public int OutsideBarWhite { get; set; }
        public int OutsideBarBlack { get; set; }
        public int[] DiceValues { get; set; } = [];
        public bool IsRolled { get; set; }
    }


    [Owned]
    public class Point
    {
        public string? PlayerColor { get; set; }
        public int Checkers { get; set; }
    }

    public enum GameStatus
    {
        WaitingForPlayers,
        ReadyToStart,
        InProgress,
        Completed,
        Abandoned
    }

    public enum DrawOfferStatus
    {
        None,       // No draw offer
        Pending,    // Draw offer made, awaiting response
        Accepted,   // Draw offer accepted
        Rejected    // Draw offer rejected
    }
}
