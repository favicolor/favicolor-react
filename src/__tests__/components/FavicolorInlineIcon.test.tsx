import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FavicolorInlineIcon } from '../../components/FavicolorInlineIcon';
import { renderWithProvider, mockFetch, cleanupFetchMock } from '../mocks/test-utils';
import {
  mockFaviconResponseSuccess,
  mockFaviconResponseCustomShape,
} from '../mocks/api-responses';

describe('FavicolorInlineIcon', () => {
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
    renderWithProvider(<FavicolorInlineIcon url="https://github.com" />);

    const skeleton = document.querySelector('span[style*="animation"]');
    expect(skeleton).toBeInTheDocument();
    // Vérifier que l'animation pulse est présente
    const style = skeleton?.getAttribute('style');
    expect(style).toContain('pulse');
  });

  it('affiche l\'icône après le chargement', async () => {
    renderWithProvider(<FavicolorInlineIcon url="https://github.com" />);

    await waitFor(() => {
      const icon = screen.getByLabelText('https://github.com');
      expect(icon).toBeInTheDocument();
    });
  });

  it('utilise le thème par défaut du provider', async () => {
    renderWithProvider(
      <FavicolorInlineIcon url="https://github.com" />,
      { defaultTheme: 'light' }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('theme=light')
      );
    });
  });

  it('override le thème par défaut avec la prop theme', async () => {
    renderWithProvider(
      <FavicolorInlineIcon url="https://google.com" theme="light" />,
      { defaultTheme: 'dark' }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('theme=light')
      );
    });
  });

  it('applique les couleurs de fond et de bordure', async () => {
    renderWithProvider(<FavicolorInlineIcon url="https://github.com" />);

    await waitFor(() => {
      const icon = screen.getByLabelText('https://github.com');
      expect(icon).toHaveStyle({
        backgroundColor: mockFaviconResponseSuccess.colors.background,
        borderColor: mockFaviconResponseSuccess.colors.border,
      });
    });
  });

  it('applique les styles personnalisés', async () => {
    renderWithProvider(
      <FavicolorInlineIcon
        url="https://stackoverflow.com"
        style={{ width: '2em', height: '2em' }}
      />
    );

    await waitFor(() => {
      const icon = screen.getByLabelText('https://stackoverflow.com');
      // Vérifier que les styles sont présents dans le style string
      expect(icon.getAttribute('style')).toContain('width: 2em');
      expect(icon.getAttribute('style')).toContain('height: 2em');
    });
  });

  it('applique les classes CSS personnalisées', async () => {
    renderWithProvider(
      <FavicolorInlineIcon url="https://github.com" className="custom-inline-class" />
    );

    await waitFor(() => {
      const icon = document.querySelector('.custom-inline-class');
      expect(icon).toBeInTheDocument();
    });
  });

  it('détecte automatiquement la forme custom et applique border-radius 50% (cercle)', async () => {
    renderWithProvider(<FavicolorInlineIcon url="https://twitter.com" />);

    await waitFor(() => {
      const icon = screen.getByLabelText('https://twitter.com');
      // twitter.com retourne shape: 'custom' qui donne borderRadius: '50%' (cercle pour inline)
      expect(icon).toHaveStyle({ borderRadius: '50%' });
    });
  });

  it('détecte automatiquement la forme squircle et applique border-radius 0.25em', async () => {
    renderWithProvider(<FavicolorInlineIcon url="https://github.com" />);

    await waitFor(() => {
      const icon = screen.getByLabelText('https://github.com');
      // github.com retourne shape: 'squircle' qui donne borderRadius: '0.25em'
      expect(icon.getAttribute('style')).toContain('border-radius: 0.25em');
    });
  });

  it('gère l\'absence d\'URL', async () => {
    renderWithProvider(<FavicolorInlineIcon url="" />);

    await waitFor(() => {
      // Ne devrait pas appeler fetch
      expect(global.fetch).not.toHaveBeenCalled();

      // Devrait être loaded avec des couleurs par défaut
      const icon = document.querySelector('span[style*="background"]');
      expect(icon).toBeInTheDocument();
    });
  });
});
