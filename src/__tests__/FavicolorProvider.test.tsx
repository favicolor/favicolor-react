import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FavicolorProvider } from '../FavicolorProvider';
import { useFavicolor } from '../hooks/useFavicolor';

// Composant de test pour lire la config du contexte
function TestComponent() {
  const config = useFavicolor();
  return (
    <div>
      <div data-testid="apiUrl">{config.apiUrl}</div>
      <div data-testid="defaultTheme">{config.defaultTheme}</div>
      <div data-testid="defaultSize">{config.defaultSize}</div>
      <div data-testid="apiKey">{config.apiKey || 'none'}</div>
      <div data-testid="appId">{config.appId || 'none'}</div>
    </div>
  );
}

describe('FavicolorProvider', () => {
  it('fournit les valeurs par défaut sans config', () => {
    render(
      <FavicolorProvider>
        <TestComponent />
      </FavicolorProvider>
    );

    expect(screen.getByTestId('apiUrl')).toHaveTextContent('https://icon.favicolor.com');
    expect(screen.getByTestId('defaultTheme')).toHaveTextContent('dark');
    expect(screen.getByTestId('defaultSize')).toHaveTextContent('64');
  });

  it('fournit une configuration personnalisée', () => {
    render(
      <FavicolorProvider
        config={{
          apiUrl: 'https://custom-api.test',
          apiKey: 'test-key',
          defaultTheme: 'light',
          defaultSize: 128,
        }}
      >
        <TestComponent />
      </FavicolorProvider>
    );

    expect(screen.getByTestId('apiUrl')).toHaveTextContent('https://custom-api.test');
    expect(screen.getByTestId('defaultTheme')).toHaveTextContent('light');
    expect(screen.getByTestId('defaultSize')).toHaveTextContent('128');
    expect(screen.getByTestId('apiKey')).toHaveTextContent('test-key');
  });

  it('merge la config partielle avec les valeurs par défaut', () => {
    render(
      <FavicolorProvider
        config={{
          apiKey: 'custom-key',
        }}
      >
        <TestComponent />
      </FavicolorProvider>
    );

    // Les valeurs non fournies doivent utiliser les defaults
    expect(screen.getByTestId('apiUrl')).toHaveTextContent('https://icon.favicolor.com');
    expect(screen.getByTestId('defaultTheme')).toHaveTextContent('dark');
    expect(screen.getByTestId('defaultSize')).toHaveTextContent('64');
    // La valeur fournie doit être présente
    expect(screen.getByTestId('apiKey')).toHaveTextContent('custom-key');
  });

  it('supporte apiKey', () => {
    render(
      <FavicolorProvider
        config={{
          apiKey: 'my-api-key',
        }}
      >
        <TestComponent />
      </FavicolorProvider>
    );

    expect(screen.getByTestId('apiKey')).toHaveTextContent('my-api-key');
  });

  it('supporte appId', () => {
    render(
      <FavicolorProvider
        config={{
          appId: 'my-app-id',
        }}
      >
        <TestComponent />
      </FavicolorProvider>
    );

    expect(screen.getByTestId('appId')).toHaveTextContent('my-app-id');
  });

  it('render les enfants correctement', () => {
    render(
      <FavicolorProvider>
        <div data-testid="child">Child content</div>
      </FavicolorProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });
});

describe('useFavicolor', () => {
  it('retourne la configuration du contexte', () => {
    render(
      <FavicolorProvider
        config={{
          apiUrl: 'https://test.api',
          apiKey: 'test-key',
        }}
      >
        <TestComponent />
      </FavicolorProvider>
    );

    expect(screen.getByTestId('apiUrl')).toHaveTextContent('https://test.api');
    expect(screen.getByTestId('apiKey')).toHaveTextContent('test-key');
  });
});
