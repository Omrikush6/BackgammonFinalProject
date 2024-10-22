using BackgammonFinalProject.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace BackgammonFinalProject.Server.Data
{
    public class BackgammonDbContext(DbContextOptions<BackgammonDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Game> Games { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure many-to-many relationship between Users and Games
            modelBuilder.Entity<User>()
                .HasMany(u => u.Games)        // User can participate in many Games
                .WithMany(g => g.Players)     // Game can have many Players (Users)
                .UsingEntity(j => j.ToTable("UserGames")); // Join table for User-Game relationship

            // Ensure PointsJson is stored as nvarchar(max)
            modelBuilder.Entity<Game>()
                .Property(g => g.PointsJson)
                .HasColumnType("nvarchar(max)");
        }
    }
}
