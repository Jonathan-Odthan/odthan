/**
 * Rate limiting basique en mémoire pour les routes sensibles
 * (connexion, inscription, demandes de leads).
 *
 * ATTENTION : cette implémentation est par instance de serveur.
 * En production multi-instances, remplacer par un store partagé
 * (Redis, Upstash) via la même interface `checkRateLimit`.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: max - bucket.count };
}
