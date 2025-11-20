import { ReactNode, CSSProperties } from 'react';

/**
 * Configuration du provider Favicolor
 */
export interface FavicolorConfig {
  /** URL de l'API Favicolor (default: 'https://api.favicolor.com') */
  apiUrl?: string;
  /** Clé API pour le développement localhost */
  apiKey?: string;
  /** ID de l'application pour la production */
  appId?: string;
  /** Thème par défaut */
  defaultTheme?: 'light' | 'dark';
  /** Taille par défaut des images (entre 32 et 128) */
  defaultSize?: number;
  /** Forme par défaut des icônes */
  defaultShape?: FavicolorShape;
  /** Activer la détection Retina/HiDPI (default: true) */
  enableRetina?: boolean;
}

/**
 * Tailles d'images acceptées pour l'affichage (entre 32 et 128 pixels)
 */
export type FavicolorSize = number;

/**
 * Tailles d'images disponibles pré-générées par l'API
 * (utilisées en interne pour l'optimisation)
 */
export type ApiSize = 32 | 64 | 96 | 128;

/**
 * Formes du conteneur de l'icône
 * - circle: rendu en cercle (border-radius: 50%)
 * - custom: pour FavicolorIcon, pas de mask. Pour FavicolorInlineIcon, rendu en cercle
 * - square/squircle: rendu en squircle avec coins arrondis (par défaut)
 * - auto: utilise la forme détectée par l'API
 */
export type FavicolorShape = 'circle' | 'custom' | 'square' | 'squircle' | 'auto';

/**
 * Props pour le composant FavicolorIcon (bloc)
 */
export interface FavicolorIconProps {
  /** URL complète ou nom de domaine */
  url: string;
  /** Taille de l'image en pixels (entre 32 et 128, arrondie automatiquement à l'API size optimale) */
  size?: number;
  /** Thème (light ou dark) */
  theme?: 'light' | 'dark';
  /** Classes CSS additionnelles */
  className?: string;
  /** Composant de fallback personnalisé */
  fallback?: ReactNode;
  /** Forme du conteneur (squircle par défaut, auto = détection API, circle = cercle, custom = pas de mask) */
  shape?: FavicolorShape;
}

/**
 * Props pour le composant FavicolorInlineIcon (inline, adaptatif en em)
 * Note: La forme est automatiquement détectée depuis l'API
 */
export interface FavicolorInlineIconProps {
  /** URL complète ou nom de domaine */
  url: string;
  /** Thème (light ou dark) */
  theme?: 'light' | 'dark';
  /** Classes CSS additionnelles */
  className?: string;
  /** Styles CSS pour override (ex: width: '1.5em') */
  style?: CSSProperties;
}

/**
 * Props pour le composant FavicolorLink
 * Note: La forme de l'icône est automatiquement détectée depuis l'API
 */
export interface FavicolorLinkProps {
  /** URL de destination du lien */
  href: string;
  /** Contenu du lien */
  children: ReactNode;
  /** Position de l'icône */
  iconPosition?: 'left' | 'right';
  /** Afficher l'icône */
  showIcon?: boolean;
  /** Classes CSS pour le lien <a> */
  className?: string;
  /** Classes CSS pour l'icône FavicolorInlineIcon */
  iconClassName?: string;
  /** Styles CSS pour l'icône FavicolorInlineIcon */
  iconStyle?: CSSProperties;
  /** Thème à utiliser pour l'icône ('light' ou 'dark') */
  theme?: 'light' | 'dark';
  /** Ouvrir dans un nouvel onglet */
  target?: string;
  /** Relation du lien */
  rel?: string;
}

/**
 * Réponse de l'API Favicolor /favicon/{domain}
 */
export interface FaviconResponse {
  domain: string;
  favicon: {
    url: string;
    format: string;
    size: number;
  };
  colors: {
    dominant: string;
    palette: string[];
    average: string;
    accent: string;
    background: string;
    border: string;
  };
  extractedAt: string;
  format: string;
  cached: boolean;
  exitReason?: string;
  shape?: FavicolorShape;
  shapeConfidence?: number;
}

/**
 * Couleurs et métadonnées extraites stockées en cache
 */
export interface ExtractedColors {
  bg: string;
  border: string;
  faviconUrl?: string;
  shape?: FavicolorShape;
}
