import type { FavicolorConfig, FavicolorSize, ApiSize } from './types';

/**
 * Normalise une URL d'API en ajoutant https:// si nécessaire
 * et en supprimant les slashes de fin
 */
export function normalizeApiUrl(url: string): string {
  if (!url) {
    return 'https://api.favicolor.com';
  }

  // Ajouter https:// si l'URL ne commence pas par http:// ou https://
  let normalized = url;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  // Supprimer les slashes de fin
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

/**
 * Extrait le nom de domaine d'une URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    // Si l'URL est invalide, on retourne la chaîne telle quelle
    return url;
  }
}

/**
 * Construit l'URL de l'API pour récupérer les couleurs d'un favicon
 */
export function buildFaviconApiUrl(
  domain: string,
  config: FavicolorConfig,
  theme?: 'light' | 'dark'
): string {
  const baseUrl = normalizeApiUrl(config.apiUrl || 'https://icon.favicolor.com');
  const params = new URLSearchParams();

  if (theme) {
    params.append('theme', theme);
  }

  // Ajouter apiKey ou appId selon la config
  if (config.apiKey) {
    params.append('apiKey', config.apiKey);
  } else if (config.appId) {
    params.append('appId', config.appId);
  }

  const queryString = params.toString();
  return `${baseUrl}/colors/${domain}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Construit l'URL de l'icône d'un favicon
 */
export function buildImageUrl(
  domain: string,
  size: FavicolorSize,
  config: FavicolorConfig,
  theme?: 'light' | 'dark'
): string {
  const baseUrl = normalizeApiUrl(config.apiUrl || 'https://icon.favicolor.com');
  const params = new URLSearchParams();

  // Ajouter size en query param
  params.append('size', size.toString());

  if (theme) {
    params.append('theme', theme);
  }

  // Ajouter apiKey ou appId selon la config
  if (config.apiKey) {
    params.append('apiKey', config.apiKey);
  } else if (config.appId) {
    params.append('appId', config.appId);
  }

  const queryString = params.toString();
  return `${baseUrl}/icon/${domain}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Génère une clé de cache pour un domaine + thème
 */
export function getCacheKey(domain: string, theme?: 'light' | 'dark'): string {
  return theme ? `favicolor:${domain}:${theme}` : `favicolor:${domain}`;
}

/**
 * Récupère le devicePixelRatio de manière SSR-safe
 * @returns Device Pixel Ratio (1 pour écran standard, 2 pour Retina, etc.)
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') {
    return 1; // SSR: retourner 1 par défaut
  }

  const dpr = window.devicePixelRatio;

  // Validation: s'assurer que c'est un nombre valide
  if (typeof dpr !== 'number' || !isFinite(dpr) || dpr <= 0) {
    return 1;
  }

  return dpr;
}

/**
 * Calcule la taille d'API optimale pour une taille d'affichage et un DPR donnés
 * @param displaySize - Taille souhaitée en pixels CSS (entre 32 et 128)
 * @param dpr - Device Pixel Ratio (optionnel, utilise getDevicePixelRatio par défaut)
 * @param enableRetina - Activer la détection Retina (default: true)
 * @returns Taille d'API optimale (32, 64, 96 ou 128)
 *
 * @example
 * getOptimalApiSize(64, 1) // → 64 (écran standard)
 * getOptimalApiSize(64, 2) // → 128 (écran Retina)
 * getOptimalApiSize(48, 2) // → 96 (48 x 2 = 96)
 * getOptimalApiSize(72, 2) // → 128 (72 x 2 = 144, cappé à 128)
 */
export function getOptimalApiSize(
  displaySize: number,
  dpr?: number,
  enableRetina: boolean = true
): ApiSize {
  // Limiter la taille d'affichage entre 32 et 128
  const clampedDisplaySize = Math.max(32, Math.min(128, displaySize));

  // Si Retina est désactivé, retourner la taille arrondie la plus proche
  if (!enableRetina) {
    return roundToNearestApiSize(clampedDisplaySize);
  }

  // Récupérer le DPR (cappé à 2x maximum)
  const deviceDpr = dpr ?? getDevicePixelRatio();
  const cappedDpr = Math.min(deviceDpr, 2);

  // Calculer la taille physique nécessaire
  const physicalSize = clampedDisplaySize * cappedDpr;

  // Arrondir à la taille API disponible la plus proche >= physicalSize
  return roundToNearestApiSize(physicalSize, true);
}

/**
 * Arrondit une taille à la taille d'API la plus proche
 * @param size - Taille à arrondir
 * @param roundUp - Si true, arrondit à la taille supérieure (pour éviter upscale)
 * @returns Taille d'API (32, 64, 96 ou 128)
 */
function roundToNearestApiSize(size: number, roundUp: boolean = false): ApiSize {
  const availableSizes: ApiSize[] = [32, 64, 96, 128];

  // Si round up, trouver la première taille >= size
  if (roundUp) {
    for (const apiSize of availableSizes) {
      if (apiSize >= size) {
        return apiSize;
      }
    }
    return 128; // Max API size
  }

  // Sinon, trouver la taille la plus proche
  return availableSizes.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  );
}

/**
 * Utilitaire pour combiner des classes CSS
 * (version simplifiée de clsx/cn)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
