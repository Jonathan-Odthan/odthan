// Catalogue central des permissions. Reutilise par le seed ET par les scripts.
// Ajouter une permission ici la rend disponible dans /admin/roles sans migration.

export const PERMISSIONS_CATALOG: { key: string; module: string; label: string }[] = [
  { key: "clients.view", module: "clients", label: "Voir les clients" },
  { key: "clients.create", module: "clients", label: "Creer un client" },
  { key: "clients.update", module: "clients", label: "Modifier un client" },
  { key: "clients.delete", module: "clients", label: "Desactiver un client" },

  { key: "services.view", module: "services", label: "Voir les services" },
  { key: "services.create", module: "services", label: "Creer un service" },
  { key: "services.update", module: "services", label: "Modifier un service" },
  { key: "services.delete", module: "services", label: "Desactiver un service" },

  { key: "requests.view", module: "requests", label: "Voir les demandes" },
  { key: "requests.create", module: "requests", label: "Creer une demande" },
  { key: "requests.update", module: "requests", label: "Modifier une demande" },
  { key: "requests.delete", module: "requests", label: "Annuler une demande" },

  { key: "orders.view", module: "orders", label: "Voir les commandes" },
  { key: "orders.create", module: "orders", label: "Creer une commande" },
  { key: "orders.update", module: "orders", label: "Modifier une commande" },
  { key: "orders.delete", module: "orders", label: "Annuler une commande" },

  { key: "payments.view", module: "payments", label: "Voir les paiements" },
  { key: "payments.create", module: "payments", label: "Enregistrer un paiement" },
  { key: "payments.update", module: "payments", label: "Modifier un paiement" },

  { key: "invoices.view", module: "invoices", label: "Voir les factures" },
  { key: "invoices.create", module: "invoices", label: "Generer une facture" },

  { key: "documents.view", module: "documents", label: "Voir les documents" },
  { key: "documents.upload", module: "documents", label: "Televerser un document" },
  { key: "documents.delete", module: "documents", label: "Supprimer un document" },

  { key: "tasks.view", module: "tasks", label: "Voir les taches" },
  { key: "tasks.create", module: "tasks", label: "Creer une tache" },
  { key: "tasks.update", module: "tasks", label: "Modifier une tache" },

  { key: "notifications.view", module: "notifications", label: "Voir les notifications" },

  { key: "messages.view", module: "messages", label: "Voir les messages" },
  { key: "messages.send", module: "messages", label: "Envoyer un message" },

  { key: "reports.view", module: "reports", label: "Voir les rapports" },

  { key: "users.view", module: "users", label: "Voir les utilisateurs" },
  { key: "users.create", module: "users", label: "Creer un utilisateur" },
  { key: "users.update", module: "users", label: "Modifier un utilisateur" },
  { key: "users.delete", module: "users", label: "Desactiver un utilisateur" },

  { key: "roles.view", module: "roles", label: "Voir les roles" },
  { key: "roles.update", module: "roles", label: "Modifier les permissions d'un role" },

  { key: "audit.view", module: "audit", label: "Voir le journal d'audit" },

  { key: "settings.view", module: "settings", label: "Voir les parametres" },
  { key: "settings.update", module: "settings", label: "Modifier les parametres" },

  { key: "security.view", module: "security", label: "Voir la securite" },
];

export const ROLE_DEFAULTS: { name: "ADMIN" | "MANAGER" | "AGENT" | "ACCOUNTANT"; label: string; permissions: string[] }[] = [
  {
    name: "ADMIN",
    label: "Administrateur",
    permissions: PERMISSIONS_CATALOG.map((p) => p.key).filter((k) => k !== "roles.update"),
  },
  {
    name: "MANAGER",
    label: "Manager",
    permissions: [
      "clients.view", "clients.create", "clients.update",
      "services.view",
      "requests.view", "requests.create", "requests.update",
      "orders.view", "orders.create", "orders.update",
      "tasks.view", "tasks.create", "tasks.update",
      "documents.view", "documents.upload",
      "notifications.view", "messages.view", "messages.send",
      "reports.view",
    ],
  },
  {
    name: "AGENT",
    label: "Agent",
    permissions: [
      "clients.view",
      "requests.view", "requests.update",
      "orders.view", "orders.update",
      "tasks.view", "tasks.update",
      "documents.view", "documents.upload",
      "notifications.view", "messages.view", "messages.send",
    ],
  },
  {
    name: "ACCOUNTANT",
    label: "Comptable",
    permissions: [
      "clients.view",
      "payments.view", "payments.create", "payments.update",
      "invoices.view", "invoices.create",
      "reports.view",
      "notifications.view",
    ],
  },
];
