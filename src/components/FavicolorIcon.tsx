"use client";

import { useState, useEffect } from 'react';
import { useFavicolor } from '../hooks/useFavicolor';
import { extractDomain, buildFaviconApiUrl, buildImageUrl, getCacheKey, cn, getOptimalApiSize, getDevicePixelRatio } from '../utils';
import type { FavicolorIconProps, ExtractedColors, FaviconResponse, FavicolorShape } from '../types';

// Import des SVG de fallback
import defaultFaviconLight from '../assets/default-favicon-no-icon.svg';
import defaultFaviconDark from '../assets/default-favicon-no-icon-dark.svg';

// Cache des couleurs extraites pour éviter de recalculer
const colorCache = new Map<string, ExtractedColors>();

// Fonction pour vider le cache (utile pendant le développement)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as Window & { clearFavicolorCache?: () => void }).clearFavicolorCache = () => {
    colorCache.clear();
    console.log('Favicolor cache cleared');
  };
}

/**
 * Composant FavicolorIcon - Affiche un favicon dans un conteneur squircle
 * avec les couleurs extraites par l'API Favicolor
 *
 * @example
 * ```tsx
 * <FavicolorIcon
 *   url="https://github.com"
 *   size={64}
 *   theme="dark"
 *   className="hover:scale-110 transition-transform"
 * />
 * ```
 */
export function FavicolorIcon({
  url,
  size,
  theme,
  className,
  fallback,
  shape
}: FavicolorIconProps) {
  const config = useFavicolor();
  const effectiveSize = size || config.defaultSize || 64;
  const effectiveTheme = theme || config.defaultTheme || 'dark';
  const effectiveShape = shape || config.defaultShape || 'squircle';
  const enableRetina = config.enableRetina !== false; // true par défaut

  const [colors, setColors] = useState<ExtractedColors>({
    bg: "#94a3b866", // slate-400 avec opacity par défaut
    border: "#64748b99" // slate-500 avec opacity par défaut
  });
  const [imageFailed, setImageFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [detectedShape, setDetectedShape] = useState<FavicolorShape | undefined>(undefined);
  const [dpr, setDpr] = useState<number>(getDevicePixelRatio());
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Écouter les changements de device pixel ratio (déplacement entre écrans)
  useEffect(() => {
    if (typeof window === 'undefined' || !enableRetina) {
      return; // Pas de détection dynamique en SSR ou si Retina désactivé
    }

    // Créer un media query pour détecter les changements de résolution
    const updateDpr = () => {
      const newDpr = getDevicePixelRatio();
      if (newDpr !== dpr) {
        setDpr(newDpr);
      }
    };

    // Écouter les changements de media query
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

    // addEventListener moderne (avec fallback pour compatibilité)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateDpr);
    } else {
      // Fallback pour anciens navigateurs
      mediaQuery.addListener(updateDpr);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateDpr);
      } else {
        mediaQuery.removeListener(updateDpr);
      }
    };
  }, [dpr, enableRetina]);

  useEffect(() => {
    // Réinitialiser l'état d'erreur d'image à chaque changement d'URL/theme/size
    setImageFailed(false);

    if (!url) {
      // Couleurs par défaut quand pas d'URL
      setColors({
        bg: "#94a3b866",
        border: "#64748b99"
      });
      setImageUrl(null);
      setIsLoaded(true);
      return;
    }

    const domain = extractDomain(url);

    // Vérifier le cache client (inclure theme dans la clé pour éviter les collisions)
    const cacheKey = getCacheKey(domain, effectiveTheme);
    if (colorCache.has(cacheKey)) {
      const cachedData = colorCache.get(cacheKey)!;
      setColors(cachedData);
      setDetectedShape(cachedData.shape);
      setIsLoaded(true);
      // Ne pas retourner ici, on va calculer l'URL après
    } else {
      // Si pas en cache, on attend la réponse API
      setIsLoaded(false);
    }

    // Fonction pour récupérer les couleurs et le favicon depuis l'API Favicolor
    const fetchColorsAndFavicon = async () => {
      const apiUrl = buildFaviconApiUrl(domain, config, effectiveTheme);

      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          console.warn(`❌ [FavicolorIcon] API error ${response.status} for ${domain}, using fallback colors`);

          // Fallback silencieux : utiliser des couleurs par défaut
          const fallbackColors: ExtractedColors = {
            bg: "#f1f5f966", // slate-100
            border: "#e2e8f099" // slate-200
          };

          colorCache.set(cacheKey, fallbackColors);
          setColors(fallbackColors);
          setIsLoaded(true);
          return;
        }

        const data: FaviconResponse = await response.json();

        if (data.colors && data.colors.background && data.colors.border) {
          // Stocker uniquement les couleurs et la shape (pas l'URL qui dépend du DPI)
          const extractedData: ExtractedColors = {
            bg: data.colors.background,
            border: data.colors.border,
            shape: data.shape
          };

          // Debug log pour les cas problématiques
          if (data.exitReason === 'domain_not_found' || data.exitReason === 'no_favicon_found') {
            console.log(`[FavicolorIcon] ${domain} (${data.exitReason}): theme=${effectiveTheme}`);
          }

          // Mettre en cache côté client (sans l'URL)
          colorCache.set(cacheKey, extractedData);
          setColors(extractedData);
          setDetectedShape(extractedData.shape);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`❌ [FavicolorIcon] Failed to fetch from Favicolor API:`, error);

        // Fallback silencieux : utiliser des couleurs par défaut
        const fallbackColors: ExtractedColors = {
          bg: "#f1f5f966", // slate-100
          border: "#e2e8f099" // slate-200
        };

        colorCache.set(cacheKey, fallbackColors);
        setColors(fallbackColors);
        setIsLoaded(true);
      }
    };

    // Appeler l'API Favicolor seulement si pas en cache
    if (!colorCache.has(cacheKey)) {
      fetchColorsAndFavicon();
    }
  }, [url, effectiveTheme, config]);

  // Calculer dynamiquement l'URL de l'image en fonction du DPR et de la taille
  useEffect(() => {
    if (!url || !isLoaded) {
      setImageUrl(null);
      return;
    }

    const domain = extractDomain(url);
    const apiSize = getOptimalApiSize(effectiveSize, dpr, enableRetina);
    const computedUrl = buildImageUrl(domain, apiSize, config, effectiveTheme);
    setImageUrl(computedUrl);
  }, [url, effectiveSize, dpr, enableRetina, isLoaded, config, effectiveTheme]);

  // Calculer le borderRadius du conteneur selon la forme
  const getBorderRadius = (): string | number => {
    // Si 'auto', utiliser la shape détectée par l'API, sinon utiliser la valeur manuelle
    const shapeToUse = effectiveShape === 'auto' ? (detectedShape || 'squircle') : effectiveShape;

    switch (shapeToUse) {
      case 'circle':
        return '50%'; // Cercle parfait
      case 'square':
      case 'squircle':
      case 'custom': // Pour custom, le conteneur garde un borderRadius, seule l'image est carrée
      case 'auto': // Fallback au cas où 'auto' arriverait ici
      default:
        return '12px'; // Squircle (coins arrondis)
    }
  };

  // Calculer le borderRadius de l'image selon la forme
  const getImageBorderRadius = (): string | number => {
    const shapeToUse = effectiveShape === 'auto' ? (detectedShape || 'squircle') : effectiveShape;

    // Pour custom, pas de border radius sur l'image (coins carrés parfaits)
    if (shapeToUse === 'custom') {
      return 0;
    }

    // Pour les autres shapes, on applique un petit border radius
    return '8px';
  };

  // Vérifier si on doit appliquer le mask-image (pas pour custom)
  // Le mask se base UNIQUEMENT sur la shape détectée par l'API, pas sur le prop shape
  const shouldApplyMask = (): boolean => {
    // Si l'API a détecté 'custom', pas de mask (même si l'utilisateur force une autre shape en prop)
    return detectedShape !== 'custom';
  };

  // Ne pas afficher tant que tout n'est pas chargé
  if (!isLoaded) {
    return (
      <div
        className={className}
        style={{
          width: effectiveSize,
          height: effectiveSize,
          borderRadius: getBorderRadius(),
          backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#e5e7eb', // gray-800 dark, gray-200 light
          animation: 'favicolor-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      >
        <style>{`
          @keyframes favicolor-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Calculer le padding proportionnel à la taille (environ 12.5% de la taille)
  const padding = Math.max(2, Math.round(effectiveSize * 0.125));

  return (
    <div
      className={className}
      style={{
        width: effectiveSize,
        height: effectiveSize,
        padding: `${padding}px`,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: getBorderRadius(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={url}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: getImageBorderRadius(),
            objectFit: 'contain',
            ...(shouldApplyMask() && {
              maskImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCA4QzAgMy41ODE3MiAzLjU4MTcyIDAgOCAwSDI0QzI4LjQxODMgMCAzMiAzLjU4MTcyIDMyIDhWMjRDMzIgMjguNDE4MyAyOC40MTgzIDMyIDI0IDMySDhDMy41ODE3MiAzMiAwIDI4LjQxODMgMCAyNFY4WiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=)',
              WebkitMaskImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCA4QzAgMy41ODE3MiAzLjU4MTcyIDAgOCAwSDI0QzI4LjQxODMgMCAzMiAzLjU4MTcyIDMyIDhWMjRDMzIgMjguNDE4MyAyOC40MTgzIDMyIDI0IDMySDhDMy41ODE3MiAzMiAwIDI4LjQxODMgMCAyNFY4WiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain'
            })
          }}
          onError={(e) => {
            console.error(`[FavicolorIcon] Image load failed for: ${imageUrl}`, e);
            setImageFailed(true);
          }}
        />
      ) : fallback ? (
        fallback
      ) : (
        <img
          src={effectiveTheme === 'dark' ? defaultFaviconDark : defaultFaviconLight}
          alt="Default favicon"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: getImageBorderRadius(),
            objectFit: 'contain',
            opacity: 0.6
          }}
        />
      )}
    </div>
  );
}
