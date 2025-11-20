import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { FavicolorLink } from '../../components/FavicolorLink';
import { renderWithProvider, mockFetch, cleanupFetchMock } from '../mocks/test-utils';

describe('FavicolorLink', () => {
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

  it('render un lien avec href', () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com">
        GitHub
      </FavicolorLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com');
    expect(link).toHaveTextContent('GitHub');
  });

  it('affiche l\'icône à gauche par défaut', async () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com">
        GitHub
      </FavicolorLink>
    );

    await waitFor(() => {
      const icon = screen.getByLabelText('https://github.com');
      const link = screen.getByRole('link');

      // L'icône doit être le premier enfant
      expect(link.firstChild).toBe(icon);
    });
  });

  it('affiche l\'icône à droite quand iconPosition="right"', async () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com" iconPosition="right">
        GitHub
      </FavicolorLink>
    );

    await waitFor(() => {
      const icon = screen.getByLabelText('https://github.com');
      const link = screen.getByRole('link');

      // L'icône doit être le dernier enfant
      expect(link.lastChild).toBe(icon);
    });
  });

  it('cache l\'icône quand showIcon={false}', () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com" showIcon={false}>
        GitHub
      </FavicolorLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('GitHub');

    // L'icône ne devrait pas être présente
    const icon = screen.queryByLabelText('https://github.com');
    expect(icon).not.toBeInTheDocument();
  });

  it('applique les classes CSS au lien', () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com" className="custom-link-class">
        GitHub
      </FavicolorLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-link-class');
  });

  it('applique les classes CSS à l\'icône', async () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com" iconClassName="custom-icon-class">
        GitHub
      </FavicolorLink>
    );

    await waitFor(() => {
      const icon = document.querySelector('.custom-icon-class');
      expect(icon).toBeInTheDocument();
    });
  });

  it('applique les styles CSS à l\'icône', async () => {
    renderWithProvider(
      <FavicolorLink
        href="https://stackoverflow.com"
        iconStyle={{ width: '2em', height: '2em' }}
      >
        StackOverflow
      </FavicolorLink>
    );

    await waitFor(() => {
      const icon = screen.getByLabelText('https://stackoverflow.com');
      // Vérifier que les styles sont présents dans le style string
      expect(icon.getAttribute('style')).toContain('width: 2em');
      expect(icon.getAttribute('style')).toContain('height: 2em');
    });
  });

  it('passe la prop theme à FavicolorInlineIcon', async () => {
    renderWithProvider(
      <FavicolorLink href="https://google.com" theme="light">
        Google
      </FavicolorLink>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('theme=light')
      );
    });
  });

  it('supporte target="_blank"', () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com" target="_blank">
        GitHub
      </FavicolorLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('supporte rel="noopener noreferrer"', () => {
    renderWithProvider(
      <FavicolorLink href="https://github.com" rel="noopener noreferrer">
        GitHub
      </FavicolorLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
