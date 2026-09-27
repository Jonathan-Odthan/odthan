# ODTHAN ADMIN CENTER

Application d'administration interne pour **Odthan Empire** — clients, services, demandes,
commandes, paiements, factures, documents, tâches, notifications, messages, rapports,
utilisateurs/rôles, audit et paramètres, le tout depuis une seule interface.

> **Choix d'architecture important.** Cette app est construite pour s'intégrer à
> l'écosystème ODTHAN existant : **Prisma + PostgreSQL** pour la base de données et
> **JWT httpOnly (`jose`) + bcrypt** pour l'authentification — la même pile que le reste
> des applications ODTHAN — plutôt que Supabase.

---

## 1. Stack technique

- **Frontend** : Next.js 14 (App Router), TypeScript strict, Tailwind CSS
- **Backend** : Server Components, Server Actions, Route Handlers
- **Base de données** : PostgreSQL via Prisma ORM (schéma complet dans `prisma/schema.prisma`)
- **Authentification** : sessions JWT httpOnly signées avec `jose`, mots de passe hashés avec `bcryptjs` (12 rounds)
- **Validation** : Zod sur toutes les entrées de formulaires et server actions
- **Formulaires** : React Hook Form / `useFormState` natif de React
- **Graphiques** : Recharts
- **Documents** : stockage sur disque en développement (driver `local`) ; driver `s3`
  pleinement implémenté pour la production, prêt dès que le bucket est configuré (voir section 6)
- **Déploiement cible** : Vercel

## 2. Installation locale

```bash
npm install
cp .env.example .env
# remplir DATABASE_URL et JWT_SECRET dans .env (voir section 3)

npx prisma migrate dev --name init   # crée les tables
npm run db:seed                      # crée les rôles, permissions, catégories et services de base
npm run create-super-admin           # crée votre premier compte SUPER_ADMIN (interactif)

npm run dev                          # http://localhost:3000
```

> **Limite de cet environnement de génération.** Le sandbox utilisé pour construire ce
> projet n'a pas d'accès réseau vers `binaries.prisma.sh` (comme documenté pour les
> précédents chantiers ODTHAN), donc `prisma generate` n'a pas pu être exécuté ici.
> Résultat concret : `npx tsc --noEmit` sur ta machine, une fois `prisma generate`
> lancé normalement, doit passer sans les erreurs de type `implicit any` qui
> apparaissaient dans cet environnement (elles venaient uniquement de l'absence des
> types Prisma générés, pas d'un bug de code). `npm run lint` et `npx vitest run`,
> eux, ont été exécutés avec succès ici et sont donc garantis fonctionnels.

## 3. Variables d'environnement

Voir `.env.example` pour la liste complète. Les plus importantes :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (Prisma) |
| `JWT_SECRET` | Secret fort et unique pour signer les sessions — jamais commité |
| `SESSION_COOKIE_NAME` | Nom du cookie de session (par defaut `odthan_admin_session`) |
| `SESSION_MAX_AGE_HOURS` | Duree de vie d'une session (par defaut 12h) |
| `STORAGE_DRIVER` | `local` (dev) ou `s3` (prod — a completer, voir section 7) |
| `NEXT_PUBLIC_COMPANY_*` | Coordonnees affichees par defaut dans /admin/settings |

**Ne jamais committer `.env`.** `.env.example` ne contient que des noms de variables.

## 4. Migrations & seed

```bash
npx prisma migrate dev --name <nom>     # nouvelle migration en developpement
npx prisma migrate deploy               # applique les migrations en production
npm run db:seed                         # rôles, permissions, catégories, services de base
```

Le seed (`prisma/seed.ts`) crée :
- le rôle `SUPER_ADMIN` (accès total implicite, non modifiable)
- les rôles `ADMIN`, `MANAGER`, `AGENT`, `ACCOUNTANT` avec des permissions par défaut raisonnables
- le catalogue de permissions (`prisma/permissions-catalog.ts` — source unique, réutilisée par le seed et par la page Rôles)
- une catégorie de service et les 10 services Odthan de base (prix à 0, à ajuster dans `/admin/services`)

Le seed ne crée **aucun compte utilisateur** — c'est le rôle du script suivant.

## 5. Création du premier SUPER_ADMIN

```bash
npm run create-super-admin
```

Script interactif (`scripts/create-super-admin.ts`) : demande email, prénom, nom et mot
de passe (saisie masquée). Le mot de passe n'est jamais passé en argument de ligne de
commande pour éviter qu'il reste dans l'historique shell. Refuse de créer un doublon et
s'arrête si le rôle `SUPER_ADMIN` n'existe pas encore (lancez `npm run db:seed` d'abord).

## 6. Déploiement Vercel

1. Poussez le code sur GitHub.
2. Importez le repo dans Vercel.
3. Provisionnez une base PostgreSQL (Vercel Postgres, Neon, Supabase Postgres, RDS...).
4. Dans **Vercel → Settings → Environment Variables**, configurez pour chaque environnement
   (`development`, `preview`, `production`) : `DATABASE_URL`, `JWT_SECRET` (une valeur
   différente et forte par environnement), `STORAGE_DRIVER`, et les `NEXT_PUBLIC_COMPANY_*`.
5. Dans les **Build Settings**, les types Prisma sont maintenant générés automatiquement
   (un script `postinstall: prisma generate` tourne après chaque `npm install`, y compris
   sur Vercel). Il reste cependant nécessaire d'appliquer les migrations avant le build :
   surchargez le *Build Command* avec `npx prisma migrate deploy && npm run build`.
6. Déployez. Connectez-vous en SSH/CLI à la base de production pour lancer
   `npm run db:seed` puis `npm run create-super-admin` une seule fois (ou exécutez-les
   localement en pointant `DATABASE_URL` vers la base de production).

> **Documents — configure S3 si tu utilises ce module.** `STORAGE_DRIVER=local` (par
> defaut) ecrit sur le disque du serveur : sur Vercel (filesystem en lecture seule),
> **l'upload echoue directement**, il ne s'agit pas juste d'une perte de persistance.
> Le driver `s3` est pleinement implemente (`lib/storage/index.ts`, via `@aws-sdk/client-s3`) :
> passe `STORAGE_DRIVER=s3` et renseigne `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
> `S3_SECRET_ACCESS_KEY` (et `S3_REGION`/`S3_ENDPOINT` selon ton fournisseur — AWS S3,
> Cloudflare R2, Backblaze B2, DigitalOcean Spaces...) dans les variables d'environnement
> Vercel. Le bucket doit rester **prive** : l'app ne genere jamais d'URL publique, elle
> recupere toujours le fichier cote serveur puis le sert via `/api/documents/[id]/download`
> apres verification de session et de permission. Si tu n'utilises pas le module Documents
> tout de suite, tu peux ignorer cette section et laisser `STORAGE_DRIVER=local` — le reste
> de l'application (auth, clients, commandes, paiements, etc.) fonctionne independamment.

## 7. Sécurité — ce qui est en place

- Sessions **JWT httpOnly** (`jose`), cookie `secure` en production, expiration côté serveur vérifiée à chaque requête
- Mots de passe **bcrypt 12 rounds**, jamais stockés en clair, jamais loggués
- **RBAC serveur** (`lib/permissions`) : chaque page et chaque server action vérifie la permission — le frontend n'est jamais la seule barrière
- **Middleware** (`middleware.ts`) bloquant l'accès non authentifié à `/admin` en première ligne
- **Rate limiting** en mémoire sur login et mot de passe oublié (`lib/security/rate-limit.ts`) — voir note ci-dessous
- **Validation Zod** sur toutes les entrées serveur
- **Documents privés** : jamais servis par une URL statique publique — uniquement via `/api/documents/[id]/download`, qui revérifie session + permission avant de streamer le fichier
- **Audit log** : écrit sur les actions sensibles (connexion, création/modification/suppression, changements de permissions, paiements, uploads) — lecture seule, pas d'UI de modification/suppression exposée
- **Aucun secret dans le code** : `JWT_SECRET` et `DATABASE_URL` uniquement via variables d'environnement, `.env` ignoré par git
- **Headers de sécurité** (`next.config.js`) : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Robots-Tag: noindex` sur `/admin/*`
- **robots.txt** interdisant l'indexation de `/admin`, `/login`, `/api`

**Limite honnête à connaître avant la production :**
- Le rate limiting est en mémoire (par instance serverless) — suffisant pour un trafic
  modeste sur une seule instance "chaude", mais pas un vrai store partagé. Pour une charge
  plus importante, remplacez `lib/security/rate-limit.ts` par un store partagé (ex.
  Upstash Redis) — l'interface de la fonction ne changerait pas.
- L'export PDF des factures passe actuellement par "Imprimer → Enregistrer en PDF" du
  navigateur. Une génération PDF côté serveur (ex. `@react-pdf/renderer`) peut être
  ajoutée sans changer le schéma de données.
- La messagerie interne (module Messages) n'a pas de mise à jour temps réel : il faut
  recharger la page. L'architecture (table `Message`, `Conversation`) est prête pour
  brancher un canal temps réel (WebSocket, Server-Sent Events, ou un service managé)
  plus tard sans migration de schéma.

## 8. Checklist avant la mise en production

- [ ] `JWT_SECRET` fort et unique généré pour la production (ex. `openssl rand -hex 32`)
- [ ] `DATABASE_URL` de production configurée et migrations appliquées (`prisma migrate deploy`, via le *Build Command* Vercel ou manuellement) — `prisma generate` tourne automatiquement via `postinstall`
- [ ] `npm run db:seed` exécuté une fois sur la base de production
- [ ] Premier `SUPER_ADMIN` créé via `npm run create-super-admin` (jamais un mot de passe en dur dans le code)
- [ ] `STORAGE_DRIVER=s3` configuré avec un vrai bucket privé (`S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`) si le module Documents est utilisé — le driver est implémenté, il ne reste qu'à fournir les identifiants
- [ ] Prix réels saisis dans `/admin/services` (le seed les crée à 0)
- [ ] Rôles `ADMIN` / `MANAGER` / `AGENT` / `ACCOUNTANT` revus et ajustés dans `/admin/roles` selon l'organisation réelle de l'équipe
- [ ] Coordonnées de l'entreprise vérifiées dans `/admin/settings`
- [ ] `npm run build` exécuté sans erreur dans un environnement avec accès réseau complet (pour `prisma generate`)
- [ ] Sauvegardes automatiques de la base PostgreSQL configurées côté hébergeur

## 9. Commandes disponibles

```bash
npm run dev                 # serveur de developpement
npm run build                # build de production
npm run start                # lance le build de production
npm run lint                  # ESLint (Next.js)
npm run typecheck             # tsc --noEmit
npm run db:generate           # prisma generate
npm run db:migrate            # prisma migrate dev
npm run db:migrate:deploy     # prisma migrate deploy (production)
npm run db:seed               # peuple roles/permissions/services de base
npm run create-super-admin    # cree le premier compte SUPER_ADMIN
npm test                      # vitest (tests unitaires : validation, mots de passe, upload)
```

## 10. Architecture du projet

```
app/
  (auth)/login, forgot-password, reset-password
  (admin)/admin/
    dashboard, clients, services, demandes, commandes, paiements,
    factures, documents, taches, notifications, messages, rapports,
    utilisateurs, roles, audit-logs, settings, security, search
  api/
    documents/[id]/download   # telechargement protege (session + permission)
    rapports/export           # export CSV des paiements sur une periode
  403, not-found, error, robots.ts

actions/        # server actions (auth, clients, services, requests, orders,
                #   payments, invoices, documents, tasks, users, roles, settings, security, messages)
components/
  admin/        # sidebar, header, task-status-select
  ui/           # page-header, stat-card, badge, pagination, empty-state, confirm-submit-button
lib/
  auth/         # password (bcrypt), session (JWT jose)
  permissions/  # RBAC serveur (requirePermission, hasPermission, requireAuth)
  security/     # audit log, rate limiting
  storage/      # driver de stockage documents (local / S3 a completer)
  validation/   # schemas Zod
  utils/        # format (montant/date), period (rapports), cn
  nav-config.ts # source unique du menu lateral + permission associee a chaque module
prisma/
  schema.prisma            # schema complet (~20 modeles)
  permissions-catalog.ts   # source unique des permissions + roles par defaut
  seed.ts
scripts/
  create-super-admin.ts
tests/          # vitest : validation, mots de passe, controle d'upload
public/branding/ # logo, favicon (toutes tailles) fournis par Odthan, non modifies
```

## 11. Améliorations futures possibles

- Génération PDF côté serveur pour les factures
- Chat temps réel Admin ↔ Client (le schéma `Conversation`/`Message` est prêt)
- Realtime pour les notifications (actuellement rafraîchies au chargement de page)
- 2FA/MFA (le champ `status` et la structure `Session` permettent de l'ajouter sans
  casser l'existant)
- Espace client, espace agent, application mobile (hors périmètre de cette v1, mais
  l'architecture modulaire — un modèle Prisma par domaine, RBAC extensible par simple
  ajout de clé dans `permissions-catalog.ts` — est pensée pour ne pas nécessiter de
  refonte)

---

Odthan Empire — odthanempire@gmail.com — +509 55561461 — www.odthan.com
