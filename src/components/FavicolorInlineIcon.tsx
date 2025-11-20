"use client";

import { useState, useEffect, CSSProperties } from 'react';
import { useFavicolor } from '../hooks/useFavicolor';
import { extractDomain, buildFaviconApiUrl, buildImageUrl, getCacheKey, cn } from '../utils';
import type { FavicolorInlineIconProps, ExtractedColors, FaviconResponse, FavicolorShape } from '../types';

// Import des SVG de fallback
import defaultFaviconLight from '../assets/default-favicon-no-icon.svg';
import defaultFaviconDark from '../assets/default-favicon-no-icon-dark.svg';

// Cache partagé avec FavicolorIcon
const colorCache = new Map<string, ExtractedColors>();

/**
 * Composant FavicolorInlineIcon - Affiche un favicon inline avec taille adaptative en em
 * Idéal pour les liens et le texte inline
 *
 * @example
 * ```tsx
 * <span className="text-lg">
 *   Visitez <FavicolorInlineIcon url="github.com" /> GitHub
 * </span>
 * ```
 */
export function FavicolorInlineIcon({
  url,
  theme,
  className,
  style
}: FavicolorInlineIconProps) {
  const config = useFavicolor();
  const effectiveTheme = theme || config.defaultTheme || 'dark';

  const [colors, setColors] = useState<ExtractedColors>({
    bg: "#94a3b866",
    border: "#64748b99"
  });
  const [imageFailed, setImageFailed] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [detectedShape, setDetectedShape] = useState<FavicolorShape | undefined>(undefined);

  useEffect(() => {
    setImageFailed(false);

    if (!url) {
      setColors({
        bg: "#94a3b866",
        border: "#64748b99"
      });
      setImageUrl(null);
      setIsLoaded(true);
      return;
    }

    const domain = extractDomain(url);
    const cacheKey = getCacheKey(domain, effectiveTheme);

    if (colorCache.has(cacheKey)) {
      const cachedData = colorCache.get(cacheKey)!;
      setColors(cachedData);
      setImageUrl(cachedData.faviconUrl || null);
      setDetectedShape(cachedData.shape);
      setIsLoaded(true);
      return;
    }

    setImageUrl(null);

    const fetchColorsAndFavicon = async () => {
      const apiUrl = buildFaviconApiUrl(domain, config, effectiveTheme);

      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const fallbackColors: ExtractedColors = {
            bg: "#f1f5f966",
            border: "#e2e8f099"
          };

          colorCache.set(cacheKey, fallbackColors);
          setColors(fallbackColors);
          setImageUrl(null);
          setIsLoaded(true);
          return;
        }

        const data: FaviconResponse = await response.json();

        if (data.colors && data.colors.background && data.colors.border) {
          // Pour l'inline icon, on utilise une taille fixe (64px) car l'affichage est en background-image
          const extractedData: ExtractedColors = {
            bg: data.colors.background,
            border: data.colors.border,
            faviconUrl: buildImageUrl(domain, 64, config, effectiveTheme),
            shape: data.shape
          };

          colorCache.set(cacheKey, extractedData);
          setColors(extractedData);
          setImageUrl(extractedData.faviconUrl || null);
          setDetectedShape(extractedData.shape);
          setIsLoaded(true);
        }
      } catch (error) {
        const fallbackColors: ExtractedColors = {
          bg: "#f1f5f966",
          border: "#e2e8f099"
        };

        colorCache.set(cacheKey, fallbackColors);
        setColors(fallbackColors);
        setImageUrl(null);
        setIsLoaded(true);
      }
    };

    fetchColorsAndFavicon();
  }, [url, effectiveTheme, config]);

  if (!isLoaded) {
    return (
      <span
        className={cn("inline-block rounded animate-pulse bg-gray-200 dark:bg-gray-800", className)}
        style={{
          width: '1.2em',
          height: '1.2em',
          verticalAlign: 'inherit',
          marginBottom: '-0.2em',
          ...style
        }}
      />
    );
  }

  // Calculer le borderRadius selon la forme détectée par l'API
  const getBorderRadius = (): string => {
    const effectiveShape = detectedShape || 'squircle';
    switch (effectiveShape) {
      case 'circle':
      case 'custom':
        return '50%'; // Cercle parfait
      case 'square':
      case 'squircle':
      case 'auto': // 'auto' ne devrait pas arriver ici, mais on le traite comme squircle
      default:
        return '0.25em'; // Squircle avec coins arrondis
    }
  };

  const defaultStyle: CSSProperties = {
    width: '1.2em',
    height: '1.2em',
    verticalAlign: 'inherit',
    marginBottom: '-0.2em',
    display: 'inline-block',
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: getBorderRadius(),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    ...style
  };

  const backgroundImage = imageUrl && !imageFailed
    ? `url(${imageUrl})`
    : `url(${effectiveTheme === 'dark' ? defaultFaviconDark : defaultFaviconLight})`;

  return (
    <span
      className={cn("inline-block", className)}
      style={{
        ...defaultStyle,
        backgroundImage
      }}
      aria-label={url}
    />
  );
}
