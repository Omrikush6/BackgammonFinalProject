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

            modelBuilder.Entity<Player>()
                 .HasOne(p => p.User)
                 .WithMany(u => u.Players)
                 .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<Player>()
                .HasOne(p => p.Game)
                .WithMany(g => g.Players)
                .HasForeignKey(p => p.GameId);

            modelBuilder.Entity<Game>()
                .Property(g => g.PointsJson)
                .HasColumnType("nvarchar(max)");
        }
    }
}
