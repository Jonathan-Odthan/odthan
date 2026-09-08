# ODTHAN

**Construire. Investir. Développer.**

Écosystème digital multi-activités regroupant :

- **www.odthan.com** — plateforme mère
- **business.odthan.com** — création d'entreprise
- **auto.odthan.com** — marketplace automobile affiliée
- **investir.odthan.com** — opportunités d'investissement
- **admin.odthan.com** — administration centrale
- **account.odthan.com** — compte utilisateur central

Un seul compte. Une seule base de données. Cinq applications indépendantes partageant les mêmes packages.

---

## 1. Prérequis

- Node.js **20+**
- npm **10+**
- PostgreSQL **14+** (ou Docker)

---

## 2. Installation

```bash
git clone <votre-repo> odthan
cd odthan
npm install
```

## 3. Configuration

```bash
cp .env.example .env
```

Remplissez au minimum :

- `DATABASE_URL`
- `NEXTAUTH_SECRET` (générez une valeur aléatoire forte : `openssl rand -base64 32`)

Les autres variables (PayPal, Stripe, stockage S3, WhatsApp, Email) peuvent rester vides en développement : les intégrations correspondantes journalisent simplement l'absence de configuration sans planter l'application.

## 4. Base de données

```bash
npm run db:generate   # génère le client Prisma
npm run db:migrate    # crée les tables (dev)
npm run db:seed       # insère les données de démonstration
```

Pour visualiser la base :

```bash
npm run db:studio
```

> ⚠️ Le seed crée un compte admin de démonstration (`demo-admin@odthan.com`). **Changez son mot de passe immédiatement** et ne l'utilisez jamais en production telle quelle.

## 5. Développement

Chaque application tourne sur son propre port :

| App | Commande | Port |
|---|---|---|
| web | `npm run dev --workspace=@odthan/web` | 3000 |
| business | `npm run dev --workspace=@odthan/business` | 3001 |
| auto | `npm run dev --workspace=@odthan/auto` | 3002 |
| investir | `npm run dev --workspace=@odthan/investir` | 3003 |
| admin | `npm run dev --workspace=@odthan/admin` | 3004 |
| account | `npm run dev --workspace=@odthan/account` | 3005 |

Ou lancer tout le monorepo avec Turborepo :

```bash
npm run dev
```

En local, ajoutez ces entrées à votre fichier hosts pour simuler les sous-domaines :

```
127.0.0.1 www.odthan.local
127.0.0.1 business.odthan.local
127.0.0.1 auto.odthan.local
127.0.0.1 investir.odthan.local
127.0.0.1 admin.odthan.local
```

## 6. Build & Production

```bash
npm run build
npm run start --workspace=@odthan/web
```

Répétez `start` pour chaque application à déployer.

## 7. Déploiement

### Vercel / Render / Railway
Chaque app du dossier `apps/*` peut être déployée comme projet indépendant pointant sur son propre sous-dossier, avec les variables d'environnement du `.env.example` renseignées dans le tableau de bord du fournisseur.

### Docker

```bash
docker compose up --build
```

Le `docker-compose.yml` lance PostgreSQL + les 5 applications. Le `Dockerfile` accepte un argument `APP` (`web`, `business`, `auto`, `investir`, `admin`) pour construire l'image ciblée.

### DNS

Configurez chez votre registrar/fournisseur DNS (non documenté ici, dépend du fournisseur) :

```
www.odthan.com       → app web
business.odthan.com  → app business
auto.odthan.com      → app auto
investir.odthan.com  → app investir
admin.odthan.com     → app admin
account.odthan.com   → app account (à construire)
```

## 8. Architecture du monorepo

```
odthan/
├── apps/
│   ├── web/         (port 3000)
│   ├── business/    (port 3001)
│   ├── auto/        (port 3002)
│   ├── investir/    (port 3003)
│   ├── admin/       (port 3004)
│   └── account/     (port 3005)
├── packages/
│   ├── ui/            composants + design system + logo
│   ├── database/      client Prisma singleton
│   ├── auth/           hash, sessions, RBAC, rate limiting
│   ├── validation/     schémas Zod partagés
│   ├── payments/       PayPal / Stripe / paiement manuel
│   ├── notifications/  Email / WhatsApp / In-App
│   ├── tracking/       affiliation & commissions
│   └── config/         domaines, devises, locales
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## 9. Sécurité

- Mots de passe hachés avec bcrypt (12 rounds)
- Sessions en base avec tokens aléatoires 384 bits, cookies `httpOnly`/`secure`/`sameSite`
- RBAC vérifié **côté serveur uniquement** (`requireRole()` dans `@odthan/auth`)
- Rate limiting sur inscription, connexion, formulaires publics
- Validation Zod systématique côté serveur sur toutes les routes API
- Documents privés référencés par clé de stockage, jamais par URL publique permanente
- Audit log sur les actions sensibles admin

## 10. Règles métier importantes

- **Investissement** : toute nouvelle opportunité est **désactivée par défaut**. Aucun rendement n'est jamais présenté comme garanti. Une activation réelle nécessite validation juridique/réglementaire et conformité KYC/AML.
- **Affiliation** : une commission n'est **jamais créée automatiquement sur un clic** — uniquement lors d'un événement commercial confirmé (lead au statut `WON`).
- **Paiements** : aucune fausse clé API n'est utilisée. Les providers PayPal/Stripe lèvent une erreur explicite tant qu'ils ne sont pas configurés, plutôt que de simuler un paiement.
- **WhatsApp/Email** : si non configurés, les messages sont journalisés et ignorés silencieusement — l'application ne plante jamais.

## 11. Maintenance & sauvegardes

- Sauvegardez `DATABASE_URL` régulièrement via `pg_dump`.
- Les migrations Prisma doivent être appliquées avec `npm run db:deploy` en production (jamais `db:migrate` en prod).
- Consultez la table `AuditLog` pour tracer les actions sensibles.

## 12. Tests

```bash
npm run test
```

*(Suite de tests à compléter — voir section Phase 13 de la feuille de route.)*

---

© ODTHAN — Tous droits réservés.
