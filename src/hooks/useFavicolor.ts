'use client';

import { useContext } from 'react';
import { FavicolorContext } from '../FavicolorProvider';
import type { FavicolorConfig } from '../types';

/**
 * Hook pour accéder à la configuration Favicolor depuis le contexte
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const config = useFavicolor();
 *   console.log(config.apiUrl); // 'https://icon.favicolor.com'
 * }
 * ```
 */
export function useFavicolor(): FavicolorConfig {
  const config = useContext(FavicolorContext);
  return config;
}
