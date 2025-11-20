import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { FavicolorProvider } from '../../FavicolorProvider';
import type { FavicolorConfig } from '../../types';
import {
  mockFaviconResponseSuccess,
  mockFaviconResponseSVG,
  mockFaviconResponseNoFavicon,
  mockFaviconResponseDomainNotFound,
  mockFaviconResponseLightTheme,
  mockFaviconResponseCustomShape,
} from './api-responses';

/**
 * Configuration par défaut pour le provider dans les tests
 */
const defaultConfig: FavicolorConfig = {
  apiUrl: 'https://api.favicolor.test',
  apiKey: 'test-api-key',
  defaultTheme: 'dark',
  defaultSize: 64,
  defaultShape: 'auto',
};

/**
 * Render un composant avec le FavicolorProvider
 */
export function renderWithProvider(
  ui: ReactNode,
  config: Partial<FavicolorConfig> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const mergedConfig = { ...defaultConfig, ...config };

  return render(
    <FavicolorProvider config={mergedConfig}>
      {ui}
    </FavicolorProvider>,
    options
  );
}

/**
 * Mock de fetch pour les tests API
 * Retourne automatiquement les bonnes réponses en fonction du domaine
 */
export function mockFetch() {
  global.fetch = vi.fn((url: string | URL) => {
    const urlString = typeof url === 'string' ? url : url.toString();

    // Extraire le domaine de l'URL (sans /v2/)
    const domainMatch = urlString.match(/\/(?:favicon|image)\/([^/?]+)/);
    const domain = domainMatch ? domainMatch[1] : '';

    // Déterminer la réponse en fonction du domaine
    let response;
    if (domain.includes('github.com')) {
      response = mockFaviconResponseSuccess;
    } else if (domain.includes('stackoverflow.com')) {
      response = mockFaviconResponseSVG;
    } else if (domain.includes('example-no-favicon.com')) {
      response = mockFaviconResponseNoFavicon;
    } else if (domain.includes('nonexistent-domain')) {
      response = mockFaviconResponseDomainNotFound;
    } else if (domain.includes('google.com')) {
      response = mockFaviconResponseLightTheme;
    } else if (domain.includes('twitter.com')) {
      response = mockFaviconResponseCustomShape;
    } else {
      // Par défaut, retourner une réponse success
      response = { ...mockFaviconResponseSuccess, domain };
    }

    // Pour les URLs /image/*, retourner un blob vide
    if (urlString.includes('/image/')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        blob: () => Promise.resolve(new Blob()),
      } as Response);
    }

    // Pour les URLs /favicon/*, retourner le JSON
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
    } as Response);
  }) as typeof fetch;
}

/**
 * Mock de fetch qui échoue (erreur réseau)
 */
export function mockFetchError() {
  global.fetch = vi.fn(() =>
    Promise.reject(new Error('Network error'))
  ) as typeof fetch;
}

/**
 * Mock de fetch qui retourne une erreur 404
 */
export function mockFetch404() {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    } as Response)
  ) as typeof fetch;
}

/**
 * Mock de fetch qui retourne une erreur 500
 */
export function mockFetch500() {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    } as Response)
  ) as typeof fetch;
}

/**
 * Nettoie les mocks de fetch
 */
export function cleanupFetchMock() {
  if (vi.isMockFunction(global.fetch)) {
    (global.fetch as ReturnType<typeof vi.fn>).mockRestore();
  }
}

/**
 * Attendre que tous les timers et promises soient résolus
 */
export async function waitForAsync() {
  await vi.waitFor(() => {}, { timeout: 100 });
}
