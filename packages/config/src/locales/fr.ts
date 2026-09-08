/**
 * ODTHAN — Dictionnaire de traduction français (locale par défaut).
 * Les données dynamiques (BlogPost, FAQ, BusinessService...) ne sont
 * PAS traduites automatiquement ici — seul le texte d'interface l'est.
 */
/**
 * Type structurel du dictionnaire : chaque clé est de type `string`.
 * Ne PAS utiliser `as const` ici — cela figerait chaque valeur comme un
 * type littéral exact et empêcherait les autres langues (ht, es) d'avoir
 * des traductions différentes (erreur TS2322 sinon).
 */
export interface Dictionary {
  common: {
    home: string;
    contact: string;
    login: string;
    register: string;
    logout: string;
    loading: string;
    send: string;
    submit: string;
    cancel: string;
    confirm: string;
    back: string;
    next: string;
  };
  nav: {
    about: string;
    activities: string;
    partners: string;
    blog: string;
    faq: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    discoverCta: string;
    createProjectCta: string;
  };
  investment: {
    disclaimer: string;
    noGuarantee: string;
  };
}

export const fr: Dictionary = {
  common: {
    home: "Accueil",
    contact: "Contact",
    login: "Connexion",
    register: "Créer un compte",
    logout: "Déconnexion",
    loading: "Chargement...",
    send: "Envoyer",
    submit: "Soumettre",
    cancel: "Annuler",
    confirm: "Confirmer",
    back: "Retour",
    next: "Suivant",
  },
  nav: {
    about: "À propos",
    activities: "Activités",
    partners: "Partenaires",
    blog: "Blog",
    faq: "FAQ",
  },
  home: {
    heroTitle: "Construire. Investir. Développer.",
    heroSubtitle:
      "Un écosystème digital qui réunit entrepreneuriat, automobile et investissement au sein d'une même plateforme.",
    discoverCta: "Découvrir ODTHAN",
    createProjectCta: "Créer mon projet",
  },
  investment: {
    disclaimer: "Simulation indicative, non garantie.",
    noGuarantee: "Aucun rendement n'est garanti.",
  },
};
