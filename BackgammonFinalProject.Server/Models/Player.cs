namespace BackgammonFinalProject.Server.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Color { get; set; }
        public int GameId { get; set; }
        public Game? Game { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
