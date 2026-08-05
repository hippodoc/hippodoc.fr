/**
 * Constantes du site — source unique de vérité pour les métadonnées,
 * le schéma Organization et les infos produit répétées sur plusieurs pages.
 * Valeurs reprises de la SPA source (index.html, footer, mentions légales).
 */

export const SITE_URL = 'https://hippodoc.fr';
export const APP_URL = 'https://app.hippodoc.fr';
export const SITE_NAME = 'Hippodoc';

/** Définition produit réutilisée mot pour mot (accueil, qui-sommes-nous, llms.txt). */
export const PRODUCT_DEFINITION =
  "Hippodoc est un logiciel français créé par un médecin pour les médecins remplaçants : il centralise revenus, rétrocessions, planning, contrats, cotisations URSSAF et CARMF, et prépare les déclarations (2035, 2042, DSFU/PAMC) avec un calcul automatique du Super-Net.";

export const CONTACT_EMAIL = 'contact@hippodoc.fr';
export const CONTACT_PHONE = '+33756898961';

export const SOCIALS = {
  twitter: 'https://twitter.com/hippodoc_app',
  linkedin: 'https://www.linkedin.com/company/hippodoc',
  instagram: 'https://www.instagram.com/hippodoc.fr/',
  facebook: 'https://www.facebook.com/hippodoc',
  linktree: 'https://linktr.ee/Hippodoc',
} as const;

export const PRICING = {
  monthly: 29,
  yearlyPerMonth: 19,
  currency: 'EUR',
  trialDays: 30,
} as const;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/lovable-uploads/og-image.png`;
export const LOGO_URL = `${SITE_URL}/lovable-uploads/1a136973-2c47-426b-a1ce-70d29cdabb35.png`;

/** Schéma Organization global — porté depuis index.html de la SPA source. */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Hippodoc',
  alternateName: 'Hippodoc - Le cockpit financier des médecins remplaçants',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
    width: 200,
    height: 60,
  },
  image: DEFAULT_OG_IMAGE,
  description:
    'Hippodoc - Le cockpit financier des médecins remplaçants qui calcule tout pour vous. Revenus, contrats, planning et Super-Net.',
  slogan: 'Le cockpit financier des médecins remplaçants qui calcule tout pour vous',
  foundingDate: '2024',
  founder: [
    {
      '@type': 'Person',
      name: 'Ryan Goburdhun',
      jobTitle: 'CEO',
    },
    {
      '@type': 'Person',
      name: 'Thomas Payet',
      jobTitle: 'CTO',
    },
  ],
  areaServed: {
    '@type': 'Country',
    name: 'France',
  },
  knowsAbout: [
    'Remplacement médical',
    'Gestion fiscale médecins',
    'URSSAF médecins libéraux',
    'CARMF',
    'Micro-BNC',
    'Cotisations sociales médecins',
  ],
  sameAs: [
    SOCIALS.twitter,
    SOCIALS.linkedin,
    SOCIALS.instagram,
    SOCIALS.facebook,
    SOCIALS.linktree,
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: CONTACT_PHONE,
    contactType: 'customer service',
    email: CONTACT_EMAIL,
    availableLanguage: 'French',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '60 rue François Ier',
    addressLocality: 'Paris',
    postalCode: '75008',
    addressCountry: 'FR',
  },
};

/** Schéma SoftwareApplication (accueil + /tarifs), avec les deux offres. */
export const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#software`,
  name: 'Hippodoc',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Abonnement mensuel',
      price: '29',
      priceCurrency: 'EUR',
      description: "29 € par mois, sans engagement, essai gratuit 30 jours.",
      url: `${SITE_URL}/tarifs`,
    },
    {
      '@type': 'Offer',
      name: 'Abonnement annuel',
      price: '19',
      priceCurrency: 'EUR',
      description: "19 € par mois en facturation annuelle, essai gratuit 30 jours.",
      url: `${SITE_URL}/tarifs`,
    },
  ],
  description:
    "Le cockpit financier des médecins remplaçants : revenus, rétrocessions, planning, URSSAF, CARMF, déclaration 2035 et Super-Net calculés automatiquement.",
  screenshot: DEFAULT_OG_IMAGE,
  datePublished: '2024-01-01',
  author: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};
