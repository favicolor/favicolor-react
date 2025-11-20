'use client';

import React, { createContext, ReactNode } from 'react';
import type { FavicolorConfig } from './types';

/**
 * Valeurs par défaut du contexte Favicolor
 */
const defaultConfig: FavicolorConfig = {
  apiUrl: 'https://icon.favicolor.com',
  defaultTheme: 'dark',
  defaultSize: 64,
};

/**
 * Contexte Favicolor pour partager la configuration
 */
export const FavicolorContext = createContext<FavicolorConfig>(defaultConfig);

/**
 * Props du FavicolorProvider
 */
export interface FavicolorProviderProps {
  /** Configuration de Favicolor */
  config?: FavicolorConfig;
  /** Composants enfants */
  children: ReactNode;
}

/**
 * Provider pour configurer Favicolor dans toute l'application
 *
 * @example
 * ```tsx
 * <FavicolorProvider config={{
 *   apiKey: process.env.NEXT_PUBLIC_FAVICOLOR_API_KEY,
 *   defaultSize: 64,
 *   defaultTheme: 'dark',
 * }}>
 *   <App />
 * </FavicolorProvider>
 * ```
 */
export function FavicolorProvider({ config, children }: FavicolorProviderProps) {
  const mergedConfig: FavicolorConfig = {
    ...defaultConfig,
    ...config,
  };

  return (
    <FavicolorContext.Provider value={mergedConfig}>
      {children}
    </FavicolorContext.Provider>
  );
}
