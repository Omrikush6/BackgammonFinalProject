using Microsoft.EntityFrameworkCore;
using BackgammonFinalProject.Server.Models;

namespace BackgammonFinalProject.Server.Data
{
    public class BackgammonDbContext(DbContextOptions<BackgammonDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Game> Games { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Game>()
                .HasMany(g => g.Players)
                .WithMany(u => u.Games)
                .UsingEntity(j => j.ToTable("UserGames"));
        }
    }
}
