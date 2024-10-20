﻿using System.Security.Cryptography;
using System.Text;

namespace BackgammonFinalProject.Server.Services
{
    public class HashingService
    {
        public string HashPassword(string password)
        {
            var salt = GenerateSalt();
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(salt));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            var hashedPassword = Convert.ToBase64String(hash);
            return $"{salt}${hashedPassword}";
        }

        public bool VerifyPassword(string password, string storedHash)
        {
            var parts = storedHash.Split('$');
            if (parts.Length != 2)
                return false;

            var salt = parts[0];
            var storedPasswordHash = parts[1];

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(salt));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            var hashedInputPassword = Convert.ToBase64String(hash);
            return hashedInputPassword == storedPasswordHash;
        }

        private static string GenerateSalt()
        {
            byte[] saltBytes = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }
            return Convert.ToBase64String(saltBytes);
        }
    }
}