// utils/functions.ts
import crypto from 'crypto';

export function generateSecurePassword(length: number = 12): string {
  // Caracteres para la contraseña (mayúsculas, minúsculas, números, símbolos)
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let password = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}