import { hash, compare } from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe en clair. Utilisé lors de l'inscription
 * et de tout changement de mot de passe. Jamais de mot de passe
 * en clair ne doit être stocké en base.
 */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

/**
 * Compare un mot de passe en clair avec son hash stocké.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}
