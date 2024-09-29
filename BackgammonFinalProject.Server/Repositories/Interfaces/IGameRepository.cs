using BackgammonFinalProject.Models;

namespace BackgammonFinalProject.Repositories.Interfaces
{
    public interface IGameRepository
    {
        Task<Game?> GetByIdAsync(int id);
        Task<List<Game>> GetActiveGamesAsync();
        Task<Game> CreateAsync(Game game);
        Task UpdateAsync(Game game);
        Task DeleteAsync(int id);
        Task<List<Game>> GetGamesByUserIdAsync(int userId);
    }
}
