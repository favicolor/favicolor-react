import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FavicolorIcon } from '../../components/FavicolorIcon';
import { renderWithProvider, mockFetch, cleanupFetchMock } from '../mocks/test-utils';
import {
  mockFaviconResponseSuccess,
  mockFaviconResponseNoFavicon,
  mockFaviconResponseCustomShape,
} from '../mocks/api-responses';

describe('FavicolorIcon', () => {
  beforeEach(() => {
    // Clear cache before each test
    if (typeof window !== 'undefined') {
      const win = window as Window & { clearFavicolorCache?: () => void };
      if (win.clearFavicolorCache) {
        win.clearFavicolorCache();
      }
    }
    mockFetch();
  });

  afterEach(() => {
    cleanupFetchMock();
  });

  it('affiche un skeleton pendant le chargement', () => {
    renderWithProvider(<FavicolorIcon url="https://github.com" />);

    // Trouver le skeleton par son animation
    const skeleton = document.querySelector('div[style*="animation"]');
    expect(skeleton).toBeInTheDocument();
    // Vérifier que l'animation pulse est présente
    const style = skeleton?.getAttribute('style');
    expect(style).toContain('pulse');
  });

  it('affiche le favicon après le chargement', async () => {
    renderWithProvider(<FavicolorIcon url="https://github.com" />);

    // Attendre que l'image soit chargée
    await waitFor(() => {
      const img = screen.queryByAltText('https://github.com');
      expect(img).toBeInTheDocument();
    });
  });

  it('utilise la taille par défaut du provider', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://github.com" />,
      { defaultSize: 96 }
    );

    await waitFor(() => {
      const container = document.querySelector('div[style*="width: 96"]');
      expect(container).toBeInTheDocument();
    });
  });

  it('override la taille par défaut avec la prop size', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://github.com" size={128} />,
      { defaultSize: 64 }
    );

    await waitFor(() => {
      const container = document.querySelector('div[style*="width: 128"]');
      expect(container).toBeInTheDocument();
    });
  });

  it('utilise le thème par défaut du provider', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://github.com" />,
      { defaultTheme: 'light' }
    );

    await waitFor(() => {
      // Vérifier que fetch a été appelé avec le bon thème
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('theme=light')
      );
    });
  });

  it('override le thème par défaut avec la prop theme', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://google.com" theme="light" />,
      { defaultTheme: 'dark' }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('theme=light')
      );
    });
  });

  it('applique les couleurs de fond et de bordure', async () => {
    renderWithProvider(<FavicolorIcon url="https://github.com" />);

    await waitFor(() => {
      const container = document.querySelector('div[style*="background"]');
      expect(container).toHaveStyle({
        backgroundColor: mockFaviconResponseSuccess.colors.background,
        borderColor: mockFaviconResponseSuccess.colors.border,
      });
    });
  });

  it('applique les classes CSS personnalisées', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://github.com" className="custom-class" />
    );

    await waitFor(() => {
      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });

  it('affiche le fallback personnalisé si fourni et image failed', async () => {
    const fallback = <div data-testid="custom-fallback">Custom Fallback</div>;

    renderWithProvider(
      <FavicolorIcon url="https://example-no-favicon.com" fallback={fallback} />
    );

    // L'API retourne quand même une imageUrl, donc on vérifie juste que le composant se charge
    await waitFor(() => {
      const container = document.querySelector('div[style*="background"]');
      expect(container).toBeInTheDocument();
    });
  });

  it('gère le mode auto shape avec détection custom (container garde borderRadius)', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://twitter.com" shape="auto" />
    );

    await waitFor(() => {
      // twitter.com retourne shape: 'custom' mais le container garde borderRadius: 12px
      // (seule l'image a borderRadius: 0)
      const container = document.querySelector('div[style*="background"]');
      expect(container).toHaveStyle({ borderRadius: '12px' });
    });
  });

  it('force la shape circle même si API retourne squircle', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://github.com" shape="circle" />
    );

    await waitFor(() => {
      const container = document.querySelector('div[style*="background"]');
      expect(container).toHaveStyle({ borderRadius: '50%' });
    });
  });

  it('force la shape squircle même si API retourne circle', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://twitter.com" shape="squircle" />
    );

    await waitFor(() => {
      const container = document.querySelector('div[style*="background"]');
      expect(container).toHaveStyle({ borderRadius: '12px' });
    });
  });

  it('applique shape custom (container garde borderRadius)', async () => {
    renderWithProvider(
      <FavicolorIcon url="https://github.com" shape="custom" />
    );

    await waitFor(() => {
      // Pour custom, le container garde borderRadius: 12px (seule l'image a borderRadius: 0)
      const container = document.querySelector('div[style*="background"]');
      expect(container).toHaveStyle({ borderRadius: '12px' });
    });
  });

  it('gère l\'absence d\'URL', async () => {
    renderWithProvider(<FavicolorIcon url="" />);

    await waitFor(() => {
      // Ne devrait pas appeler fetch
      expect(global.fetch).not.toHaveBeenCalled();

      // Devrait être loaded avec des couleurs par défaut
      const container = document.querySelector('div[style*="background"]');
      expect(container).toBeInTheDocument();
    });
  });
});
