using BackgammonFinalProject.Data;
using BackgammonFinalProject.Models;
using BackgammonFinalProject.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackgammonFinalProject.Repositories
{
    using Microsoft.EntityFrameworkCore;

    public class GameRepository : IGameRepository
    {
        private readonly BackgammonDbContext _context;

        public GameRepository(BackgammonDbContext context) => _context = context;

        public async Task<Game?> GetByIdAsync(int id)
        {
            return await _context.Games
                .Include(x => x.Players)
                .Include(x => x.Messages)
                .AsSplitQuery()
                .FirstOrDefaultAsync(g => g.Id == id);
        }
        public async Task<List<Game>> GetActiveGamesAsync() =>
            await _context.Games.Where(g => g.EndTime == null).Include(x => x.Players).Include(x =>x.Messages).AsSplitQuery().ToListAsync();

        public async Task<Game> CreateAsync(Game game)
        {
            _context.Games.Add(game);
            await _context.SaveChangesAsync();
            return game;
        }

        public async Task UpdateAsync(Game game)
        {
            _context.Entry(game).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var game = await _context.Games.FindAsync(id);
            if (game != null)
            {
                _context.Games.Remove(game);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Game>> GetGamesByUserIdAsync(int userId) =>
            await _context.Games
                .Where(g => g.Players.Any(p => p.Id == userId))
                .ToListAsync();
    }
}
