import type { FaviconResponse } from '../../types';

/**
 * Réponse API mockée pour un domaine avec favicon valide
 */
export const mockFaviconResponseSuccess: FaviconResponse = {
  domain: 'github.com',
  favicon: {
    url: 'https://github.com/favicon.ico',
    format: 'ico',
    size: 64,
  },
  colors: {
    dominant: '#24292f',
    palette: ['#24292f', '#ffffff', '#0969da'],
    average: '#24292f',
    accent: '#0969da',
    background: '#24292f66',
    border: '#24292f99',
  },
  extractedAt: '2024-01-01T00:00:00.000Z',
  format: 'hex',
  cached: false,
  shape: 'squircle',
  shapeConfidence: 0.85,
};

/**
 * Réponse API mockée pour un domaine avec favicon SVG
 */
export const mockFaviconResponseSVG: FaviconResponse = {
  domain: 'stackoverflow.com',
  favicon: {
    url: 'https://stackoverflow.com/favicon.svg',
    format: 'svg',
    size: 64,
  },
  colors: {
    dominant: '#f48024',
    palette: ['#f48024', '#ffffff', '#bcbbbb'],
    average: '#f48024',
    accent: '#f48024',
    background: '#f4802466',
    border: '#f4802499',
  },
  extractedAt: '2024-01-01T00:00:00.000Z',
  format: 'hex',
  cached: true,
  shape: 'circle',
  shapeConfidence: 0.95,
};

/**
 * Réponse API mockée pour un domaine sans favicon trouvé
 */
export const mockFaviconResponseNoFavicon: FaviconResponse = {
  domain: 'example-no-favicon.com',
  favicon: {
    url: '',
    format: '',
    size: 0,
  },
  colors: {
    dominant: '#f1f5f9',
    palette: ['#f1f5f9', '#e2e8f0'],
    average: '#f1f5f9',
    accent: '#94a3b8',
    background: '#f1f5f966',
    border: '#e2e8f099',
  },
  extractedAt: '2024-01-01T00:00:00.000Z',
  format: 'hex',
  cached: false,
  exitReason: 'no_favicon_found',
};

/**
 * Réponse API mockée pour un domaine non trouvé
 */
export const mockFaviconResponseDomainNotFound: FaviconResponse = {
  domain: 'nonexistent-domain-xyz.com',
  favicon: {
    url: '',
    format: '',
    size: 0,
  },
  colors: {
    dominant: '#f1f5f9',
    palette: ['#f1f5f9', '#e2e8f0'],
    average: '#f1f5f9',
    accent: '#94a3b8',
    background: '#f1f5f966',
    border: '#e2e8f099',
  },
  extractedAt: '2024-01-01T00:00:00.000Z',
  format: 'hex',
  cached: false,
  exitReason: 'domain_not_found',
};

/**
 * Réponse API mockée avec thème light
 */
export const mockFaviconResponseLightTheme: FaviconResponse = {
  domain: 'google.com',
  favicon: {
    url: 'https://google.com/favicon.ico',
    format: 'ico',
    size: 64,
  },
  colors: {
    dominant: '#4285f4',
    palette: ['#4285f4', '#ea4335', '#fbbc05', '#34a853'],
    average: '#4285f4',
    accent: '#ea4335',
    background: '#4285f466',
    border: '#4285f499',
  },
  extractedAt: '2024-01-01T00:00:00.000Z',
  format: 'hex',
  cached: true,
  shape: 'square',
  shapeConfidence: 0.75,
};

/**
 * Réponse API mockée avec custom shape
 */
export const mockFaviconResponseCustomShape: FaviconResponse = {
  domain: 'twitter.com',
  favicon: {
    url: 'https://twitter.com/favicon.ico',
    format: 'ico',
    size: 64,
  },
  colors: {
    dominant: '#1da1f2',
    palette: ['#1da1f2', '#ffffff', '#14171a'],
    average: '#1da1f2',
    accent: '#1da1f2',
    background: '#1da1f266',
    border: '#1da1f299',
  },
  extractedAt: '2024-01-01T00:00:00.000Z',
  format: 'hex',
  cached: false,
  shape: 'custom',
  shapeConfidence: 0.9,
};
