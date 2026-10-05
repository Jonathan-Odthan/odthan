# Écosystème ODTHAN

Un seul dépôt, un seul déploiement Vercel, trois façades :

| Domaine | Contenu |
|---|---|
| `www.odthan.com` | Page d'accueil de l'écosystème + `/admin` (Odthan Admin Center) |
| `business.odthan.com` | Le site vitrine (ex-`odthan-site`) + portail client (`/compte`) |

Stack : **HTML/CSS/JS vanille** + **Vercel Serverless Functions** (Node.js) + **PostgreSQL** (`pg`, SQL brut, pas d'ORM) + **JWT httpOnly** (`jose`) + **bcrypt**. Aucun framework frontend, aucune dépendance inutile.

---

## 1. Comment le routage par domaine fonctionne

`vercel.json` redirige **toutes** les requêtes arrivant sur `business.odthan.com` vers `/business/*` (host-based rewrite). `www.odthan.com` sert directement la racine (`/`, `/admin/*`, `/compte` → redirige vers business). C'est un seul projet Vercel avec les deux domaines attachés — pas deux déploiements séparés.

```
/                      → page d'accueil écosystème (www.odthan.com)
/admin/*               → Odthan Admin Center (www.odthan.com/admin)
/business/*            → site vitrine + portail client (business.odthan.com)
/api/public/*          → formulaires publics (contact, réservation, kòmanse biznis), tracking analytics
/api/client/*          → portail client (signup, login, demandes, messages)
/api/admin/*           → tout l'Admin Center
/lib/*                 → code partagé (jamais exposé publiquement, hors de /api et /admin)
/db/schema.sql         → schéma PostgreSQL unifié
```

## 2. Installation locale

```bash
npm install
cp .env.example .env
# remplir DATABASE_URL et JWT_SECRET

psql "$DATABASE_URL" -f db/schema.sql   # crée toutes les tables
npm run seed                             # rôles, permissions, catégorie + services de base
npm run create-super-admin               # crée ton premier compte admin (interactif)
```

Il n'y a pas de serveur de dev unique à lancer (pas de `next dev` ou équivalent) : ce sont des fichiers statiques + fonctions serverless. Utilise `vercel dev` (CLI Vercel) pour un environnement local qui reproduit fidèlement le routage et les fonctions :

```bash
npm install -g vercel
vercel dev
```

## 3. Variables d'environnement

Voir `.env.example`. Les essentielles :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_SECRET` | Secret fort pour signer les sessions (admin ET client) |
| `COOKIE_DOMAIN` | `.odthan.com` en production — partage la session entre `www` et `business` |
| `STORAGE_DRIVER` | `local` (dev) ou `s3` (prod — voir section 6) |

## 4. Déploiement Vercel

1. Pousse le code sur GitHub, importe le repo dans Vercel.
2. **Settings → Domains** : ajoute `www.odthan.com` ET `business.odthan.com` au **même projet**.
3. **Settings → Environment Variables** : configure `DATABASE_URL`, `JWT_SECRET`, `COOKIE_DOMAIN=.odthan.com`, `STORAGE_DRIVER`, et les `S3_*` si tu actives les documents.
4. Provisionne une base PostgreSQL (Vercel Postgres, Neon...), applique `db/schema.sql`.
5. Déploie, puis lance `npm run seed` et `npm run create-super-admin` en pointant `DATABASE_URL` vers la base de prod.
6. Connecte-toi sur `https://www.odthan.com/admin/login.html`.

## 5. Sécurité — ce qui est en place

- Sessions **JWT httpOnly**, cookies séparés pour admin et client, `Secure` en production
- **bcrypt 12 rounds**, verrouillage de compte après 5 tentatives (15 min)
- **RBAC serveur** (`lib/permissions.js`) : chaque route admin vérifie la permission réelle, jamais seulement le frontend
- **CSRF double-soumission** sur toutes les actions qui modifient des données
- **Rate limiting persistant** (table `rate_limits`, survit aux redémarrages de fonctions)
- **Documents privés** : jamais d'URL publique — toujours via une route qui revérifie session + permission avant de streamer le fichier
- **Analytics respectueux de la vie privée** : pas de cookie tiers, pas d'empreinte navigateur, géolocalisation via les en-têtes que Vercel fournit nativement (aucun service payant)
- **Audit log** complet sur les actions sensibles (connexions, créations/modifications, changements de permissions, paiements, uploads)
- **Journal d'audit en lecture seule** — aucune UI de modification/suppression

## 6. Limites honnêtes à connaître

- **Stockage de documents** : `STORAGE_DRIVER=local` écrit sur le disque du serveur — **échoue directement sur Vercel** (filesystem en lecture seule). Le driver `s3` (`lib/storage.js`) est pleinement implémenté ; il suffit de renseigner `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` pour un bucket privé (AWS S3, Cloudflare R2, Backblaze B2...).
- **Sessions multiples** : les sessions sont des JWT sans état stocké côté serveur (hors verrouillage anti-bruteforce). Il n'est donc pas possible de lister et fermer individuellement les sessions actives sur d'autres appareils — changer son mot de passe est le seul moyen de forcer une déconnexion globale pour l'instant.
- **Factures en PDF** : export via "Imprimer → Enregistrer en PDF" du navigateur, pas de génération PDF côté serveur.
- **Messages** : pas de mise à jour en temps réel (ni admin ni client) — il faut recharger pour voir les nouveaux messages. Le schéma (`conversations`/`messages`) est prêt pour brancher du temps réel plus tard.
- **Build/test** : n'a pas pu être vérifié avec une vraie base PostgreSQL dans l'environnement où ce projet a été généré (pas d'accès réseau à une base de données). La syntaxe de tous les fichiers JS a été vérifiée (`node --check`) et tous les `require()` résolvent sans erreur ; teste les parcours critiques (connexion, création de client, paiement) en local avant la mise en production.

## 7. Checklist avant production

- [ ] `JWT_SECRET` fort et unique généré (`openssl rand -hex 32`)
- [ ] `db/schema.sql` appliqué sur la base de production
- [ ] `npm run seed` exécuté une fois
- [ ] Premier compte créé via `npm run create-super-admin`
- [ ] `COOKIE_DOMAIN=.odthan.com` configuré si tu utilises les deux domaines
- [ ] `STORAGE_DRIVER=s3` configuré si le module Documents est utilisé
- [ ] Prix réels saisis dans `/admin/services.html` (le seed les crée à 0)
- [ ] Rôles ADMIN/MANAGER/AGENT/ACCOUNTANT ajustés dans `/admin/roles.html` selon ton équipe
- [ ] Coordonnées de l'entreprise vérifiées dans `/admin/settings.html`
- [ ] Sauvegardes automatiques PostgreSQL configurées côté hébergeur

## 8. Commandes disponibles

```bash
npm run seed               # rôles, permissions, catégorie, services de base
npm run create-super-admin # crée le premier compte admin
```

---

Odthan Empire — odthanempire@gmail.com — +509 55561461 — www.odthan.com
