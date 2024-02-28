using System.Security.Cryptography;

namespace TaskOne.Method
{
    /// <summary>
    /// 
    ///   Register
    ///   string hashedPassword = PasswordHasher.HashPassword("user_password");
    ///   Store hashedPassword and salt in the database.

    ///   Login
    ///   bool isPasswordValid = PasswordHasher.VerifyPassword("user_input_password", storedHashedPasswordFromDatabase);

    /// </summary>
    public static class PasswordHasher
    {
        private const int SaltSize = 16;
        private const int HashSize = 20;
        private const int Iterations = 10000;

        public static string HashPassword(string password)
        {
            using (var deriveBytes = new Rfc2898DeriveBytes(password, SaltSize, Iterations))
            {
                byte[] salt = deriveBytes.Salt;
                byte[] hash = deriveBytes.GetBytes(HashSize);

                byte[] hashBytes = new byte[SaltSize + HashSize];
                Array.Copy(salt, 0, hashBytes, 0, SaltSize);
                Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);

                return Convert.ToBase64String(hashBytes);
            }
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            byte[] hashBytes = Convert.FromBase64String(hashedPassword);
            byte[] salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);

            using (var deriveBytes = new Rfc2898DeriveBytes(password, salt, Iterations))
            {
                byte[] hash = deriveBytes.GetBytes(HashSize);

                for (int i = 0; i < HashSize; i++)
                {
                    if (hashBytes[i + SaltSize] != hash[i])
                        return false;
                }

                return true;
            }
        }
    }
}
