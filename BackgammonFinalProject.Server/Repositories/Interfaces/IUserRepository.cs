using BackgammonFinalProject.Server.Models;

namespace BackgammonFinalProject.Server.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<User> CreateAsync(User user);
        Task<bool> UpdateAsync(User user);
        Task DeleteAsync(int id);
    }
}
