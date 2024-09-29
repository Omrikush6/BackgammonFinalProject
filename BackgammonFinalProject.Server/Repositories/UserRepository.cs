using BackgammonFinalProject.Data;
using BackgammonFinalProject.Models;
using BackgammonFinalProject.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BackgammonFinalProject.Repositories
{
    using Microsoft.EntityFrameworkCore;

    public class UserRepository : IUserRepository
    {
        private readonly BackgammonDbContext _context;

        public UserRepository(BackgammonDbContext context) => _context = context;

        public async Task<User?> GetByIdAsync(int id) => await _context.Users.FindAsync(id);

        public async Task<User?> GetByUsernameAsync(string username) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.Id);
            if (existingUser == null)
            {
                return false;
            }

            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.PasswordHash = user.PasswordHash;

            _context.Entry(existingUser).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }

}
