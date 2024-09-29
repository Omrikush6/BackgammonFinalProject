using Microsoft.EntityFrameworkCore;
using BackgammonFinalProject.Models;

namespace BackgammonFinalProject.Data
{
    public class BackgammonDbContext : DbContext
    {
        public BackgammonDbContext(DbContextOptions<BackgammonDbContext> options): base(options)
        {
        }
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
