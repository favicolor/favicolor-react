import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractDomain,
  buildFaviconApiUrl,
  buildImageUrl,
  getCacheKey,
  cn,
  getDevicePixelRatio,
  getOptimalApiSize,
} from '../utils';
import type { FavicolorConfig } from '../types';

describe('extractDomain', () => {
  it('extrait le domaine d\'une URL complète avec https', () => {
    expect(extractDomain('https://github.com')).toBe('github.com');
    expect(extractDomain('https://www.google.com')).toBe('www.google.com');
  });

  it('extrait le domaine d\'une URL complète avec http', () => {
    expect(extractDomain('http://github.com')).toBe('github.com');
  });

  it('extrait le domaine d\'une URL avec un chemin', () => {
    expect(extractDomain('https://github.com/anthropics/claude-code')).toBe('github.com');
  });

  it('ajoute https:// automatiquement si le protocole est absent', () => {
    expect(extractDomain('github.com')).toBe('github.com');
    expect(extractDomain('www.google.com')).toBe('www.google.com');
  });

  it('extrait le domaine avec sous-domaine', () => {
    expect(extractDomain('https://api.github.com')).toBe('api.github.com');
    expect(extractDomain('subdomain.example.com')).toBe('subdomain.example.com');
  });

  it('retourne la chaîne telle quelle si l\'URL est invalide', () => {
    expect(extractDomain('not-a-url')).toBe('not-a-url');
    expect(extractDomain('::invalid::')).toBe('::invalid::');
  });

  it('gère les URLs avec port', () => {
    expect(extractDomain('https://localhost:3000')).toBe('localhost');
    expect(extractDomain('http://example.com:8080/path')).toBe('example.com');
  });
});

describe('buildFaviconApiUrl', () => {
  const baseConfig: FavicolorConfig = {
    apiUrl: 'https://api.favicolor.test',
  };

  it('construit une URL basique sans paramètres', () => {
    const url = buildFaviconApiUrl('github.com', baseConfig);
    expect(url).toBe('https://api.favicolor.test/v2/favicon/github.com');
  });

  it('ajoute le paramètre theme', () => {
    const url = buildFaviconApiUrl('github.com', baseConfig, 'dark');
    expect(url).toBe('https://api.favicolor.test/v2/favicon/github.com?theme=dark');
  });

  it('ajoute le paramètre apiKey', () => {
    const config = { ...baseConfig, apiKey: 'test-key' };
    const url = buildFaviconApiUrl('github.com', config);
    expect(url).toContain('apiKey=test-key');
  });

  it('ajoute le paramètre appId', () => {
    const config = { ...baseConfig, appId: 'test-app' };
    const url = buildFaviconApiUrl('github.com', config);
    expect(url).toContain('appId=test-app');
  });

  it('préfère apiKey sur appId si les deux sont fournis', () => {
    const config = { ...baseConfig, apiKey: 'test-key', appId: 'test-app' };
    const url = buildFaviconApiUrl('github.com', config);
    expect(url).toContain('apiKey=test-key');
    expect(url).not.toContain('appId=test-app');
  });

  it('combine theme et apiKey', () => {
    const config = { ...baseConfig, apiKey: 'test-key' };
    const url = buildFaviconApiUrl('github.com', config, 'light');
    expect(url).toContain('theme=light');
    expect(url).toContain('apiKey=test-key');
  });

  it('utilise l\'URL par défaut si apiUrl n\'est pas fournie', () => {
    const config: FavicolorConfig = {};
    const url = buildFaviconApiUrl('github.com', config);
    expect(url).toBe('https://api.favicolor.com/v2/favicon/github.com');
  });
});

describe('buildImageUrl', () => {
  const baseConfig: FavicolorConfig = {
    apiUrl: 'https://api.favicolor.test',
  };

  it('construit une URL avec le paramètre size', () => {
    const url = buildImageUrl('github.com', 64, baseConfig);
    expect(url).toContain('/v2/image/github.com');
    expect(url).toContain('size=64');
  });

  it('supporte les différentes tailles', () => {
    expect(buildImageUrl('github.com', 32, baseConfig)).toContain('size=32');
    expect(buildImageUrl('github.com', 64, baseConfig)).toContain('size=64');
    expect(buildImageUrl('github.com', 96, baseConfig)).toContain('size=96');
    expect(buildImageUrl('github.com', 128, baseConfig)).toContain('size=128');
  });

  it('ajoute le paramètre theme', () => {
    const url = buildImageUrl('github.com', 64, baseConfig, 'dark');
    expect(url).toContain('theme=dark');
  });

  it('ajoute le paramètre apiKey', () => {
    const config = { ...baseConfig, apiKey: 'test-key' };
    const url = buildImageUrl('github.com', 64, config);
    expect(url).toContain('apiKey=test-key');
  });

  it('ajoute le paramètre appId', () => {
    const config = { ...baseConfig, appId: 'test-app' };
    const url = buildImageUrl('github.com', 64, config);
    expect(url).toContain('appId=test-app');
  });

  it('préfère apiKey sur appId si les deux sont fournis', () => {
    const config = { ...baseConfig, apiKey: 'test-key', appId: 'test-app' };
    const url = buildImageUrl('github.com', 64, config);
    expect(url).toContain('apiKey=test-key');
    expect(url).not.toContain('appId=test-app');
  });

  it('combine size, theme et apiKey', () => {
    const config = { ...baseConfig, apiKey: 'test-key' };
    const url = buildImageUrl('github.com', 96, config, 'light');
    expect(url).toContain('size=96');
    expect(url).toContain('theme=light');
    expect(url).toContain('apiKey=test-key');
  });

  it('utilise l\'URL par défaut si apiUrl n\'est pas fournie', () => {
    const config: FavicolorConfig = {};
    const url = buildImageUrl('github.com', 64, config);
    expect(url).toContain('https://api.favicolor.com/v2/image/github.com');
  });
});

describe('getCacheKey', () => {
  it('génère une clé de cache simple sans thème', () => {
    expect(getCacheKey('github.com')).toBe('favicolor:github.com');
  });

  it('génère une clé de cache avec thème dark', () => {
    expect(getCacheKey('github.com', 'dark')).toBe('favicolor:github.com:dark');
  });

  it('génère une clé de cache avec thème light', () => {
    expect(getCacheKey('github.com', 'light')).toBe('favicolor:github.com:light');
  });

  it('génère des clés différentes pour le même domaine avec des thèmes différents', () => {
    const keyDark = getCacheKey('github.com', 'dark');
    const keyLight = getCacheKey('github.com', 'light');
    const keyNone = getCacheKey('github.com');

    expect(keyDark).not.toBe(keyLight);
    expect(keyDark).not.toBe(keyNone);
    expect(keyLight).not.toBe(keyNone);
  });

  it('génère des clés cohérentes (même input = même output)', () => {
    expect(getCacheKey('example.com', 'dark')).toBe('favicolor:example.com:dark');
    expect(getCacheKey('example.com', 'dark')).toBe('favicolor:example.com:dark');
  });
});

describe('cn', () => {
  it('combine plusieurs classes CSS', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('filtre les valeurs undefined', () => {
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
  });

  it('filtre les valeurs null', () => {
    expect(cn('class1', null, 'class2')).toBe('class1 class2');
  });

  it('filtre les valeurs false', () => {
    expect(cn('class1', false, 'class2')).toBe('class1 class2');
  });

  it('filtre les chaînes vides', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2');
  });

  it('retourne une chaîne vide si aucune classe valide', () => {
    expect(cn(undefined, null, false, '')).toBe('');
  });

  it('gère un seul argument', () => {
    expect(cn('single-class')).toBe('single-class');
  });

  it('gère aucun argument', () => {
    expect(cn()).toBe('');
  });

  it('combine correctement avec des conditionnelles', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });
});

describe('getDevicePixelRatio', () => {
  beforeEach(() => {
    // Reset window.devicePixelRatio avant chaque test
    vi.stubGlobal('window', { devicePixelRatio: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne 1 en environnement SSR (window undefined)', () => {
    vi.stubGlobal('window', undefined);
    expect(getDevicePixelRatio()).toBe(1);
  });

  it('retourne le devicePixelRatio du navigateur pour écran standard', () => {
    vi.stubGlobal('window', { devicePixelRatio: 1 });
    expect(getDevicePixelRatio()).toBe(1);
  });

  it('retourne le devicePixelRatio pour écran Retina (2x)', () => {
    vi.stubGlobal('window', { devicePixelRatio: 2 });
    expect(getDevicePixelRatio()).toBe(2);
  });

  it('retourne le devicePixelRatio pour écran HiDPI (1.5x)', () => {
    vi.stubGlobal('window', { devicePixelRatio: 1.5 });
    expect(getDevicePixelRatio()).toBe(1.5);
  });

  it('retourne le devicePixelRatio pour écran ultra HiDPI (3x)', () => {
    vi.stubGlobal('window', { devicePixelRatio: 3 });
    expect(getDevicePixelRatio()).toBe(3);
  });

  it('retourne 1 si devicePixelRatio est invalide (NaN)', () => {
    vi.stubGlobal('window', { devicePixelRatio: NaN });
    expect(getDevicePixelRatio()).toBe(1);
  });

  it('retourne 1 si devicePixelRatio est invalide (Infinity)', () => {
    vi.stubGlobal('window', { devicePixelRatio: Infinity });
    expect(getDevicePixelRatio()).toBe(1);
  });

  it('retourne 1 si devicePixelRatio est invalide (négatif)', () => {
    vi.stubGlobal('window', { devicePixelRatio: -1 });
    expect(getDevicePixelRatio()).toBe(1);
  });

  it('retourne 1 si devicePixelRatio est invalide (zéro)', () => {
    vi.stubGlobal('window', { devicePixelRatio: 0 });
    expect(getDevicePixelRatio()).toBe(1);
  });

  it('retourne 1 si devicePixelRatio n\'est pas un nombre', () => {
    vi.stubGlobal('window', { devicePixelRatio: 'not-a-number' as unknown as number });
    expect(getDevicePixelRatio()).toBe(1);
  });
});

describe('getOptimalApiSize', () => {
  describe('avec Retina désactivé (enableRetina = false)', () => {
    it('retourne la taille arrondie la plus proche pour 32', () => {
      expect(getOptimalApiSize(32, undefined, false)).toBe(32);
    });

    it('retourne la taille arrondie la plus proche pour 48 (milieu entre 32 et 64)', () => {
      // 48 est équidistant de 32 et 64, donc arrondi vers le bas (32)
      expect(getOptimalApiSize(48, undefined, false)).toBe(32);
    });

    it('retourne la taille arrondie la plus proche pour 64', () => {
      expect(getOptimalApiSize(64, undefined, false)).toBe(64);
    });

    it('retourne la taille arrondie la plus proche pour 80 (milieu entre 64 et 96)', () => {
      // 80 est équidistant de 64 et 96, donc arrondi vers le bas (64)
      expect(getOptimalApiSize(80, undefined, false)).toBe(64);
    });

    it('retourne la taille arrondie la plus proche pour 96', () => {
      expect(getOptimalApiSize(96, undefined, false)).toBe(96);
    });

    it('retourne la taille arrondie la plus proche pour 112 (milieu entre 96 et 128)', () => {
      // 112 est équidistant de 96 et 128, donc arrondi vers le bas (96)
      expect(getOptimalApiSize(112, undefined, false)).toBe(96);
    });

    it('retourne la taille arrondie la plus proche pour 128', () => {
      expect(getOptimalApiSize(128, undefined, false)).toBe(128);
    });

    it('clamp une taille inférieure à 32', () => {
      expect(getOptimalApiSize(16, undefined, false)).toBe(32);
    });

    it('clamp une taille supérieure à 128', () => {
      expect(getOptimalApiSize(200, undefined, false)).toBe(128);
    });
  });

  describe('avec Retina activé et DPR 1x (écran standard)', () => {
    it('retourne 32 pour displaySize=32 (32 * 1 = 32)', () => {
      expect(getOptimalApiSize(32, 1, true)).toBe(32);
    });

    it('retourne 64 pour displaySize=64 (64 * 1 = 64)', () => {
      expect(getOptimalApiSize(64, 1, true)).toBe(64);
    });

    it('retourne 96 pour displaySize=96 (96 * 1 = 96)', () => {
      expect(getOptimalApiSize(96, 1, true)).toBe(96);
    });

    it('retourne 128 pour displaySize=128 (128 * 1 = 128)', () => {
      expect(getOptimalApiSize(128, 1, true)).toBe(128);
    });

    it('retourne 64 pour displaySize=48 (48 * 1 = 48, arrondi à 64)', () => {
      expect(getOptimalApiSize(48, 1, true)).toBe(64);
    });

    it('retourne 96 pour displaySize=80 (80 * 1 = 80, arrondi à 96)', () => {
      expect(getOptimalApiSize(80, 1, true)).toBe(96);
    });
  });

  describe('avec Retina activé et DPR 2x (écran Retina)', () => {
    it('retourne 64 pour displaySize=32 (32 * 2 = 64)', () => {
      expect(getOptimalApiSize(32, 2, true)).toBe(64);
    });

    it('retourne 128 pour displaySize=64 (64 * 2 = 128)', () => {
      expect(getOptimalApiSize(64, 2, true)).toBe(128);
    });

    it('retourne 128 pour displaySize=96 (96 * 2 = 192, cappé à 128)', () => {
      expect(getOptimalApiSize(96, 2, true)).toBe(128);
    });

    it('retourne 128 pour displaySize=128 (128 * 2 = 256, cappé à 128)', () => {
      expect(getOptimalApiSize(128, 2, true)).toBe(128);
    });

    it('retourne 96 pour displaySize=48 (48 * 2 = 96)', () => {
      expect(getOptimalApiSize(48, 2, true)).toBe(96);
    });

    it('retourne 64 pour displaySize=40 (40 * 2 = 80, arrondi à 96 mais capping)', () => {
      expect(getOptimalApiSize(40, 2, true)).toBe(96);
    });

    it('retourne 128 pour displaySize=72 (72 * 2 = 144, cappé à 128)', () => {
      expect(getOptimalApiSize(72, 2, true)).toBe(128);
    });
  });

  describe('avec Retina activé et DPR 1.5x (écran HiDPI)', () => {
    it('retourne 64 pour displaySize=32 (32 * 1.5 = 48, arrondi à 64)', () => {
      expect(getOptimalApiSize(32, 1.5, true)).toBe(64);
    });

    it('retourne 96 pour displaySize=64 (64 * 1.5 = 96)', () => {
      expect(getOptimalApiSize(64, 1.5, true)).toBe(96);
    });

    it('retourne 128 pour displaySize=96 (96 * 1.5 = 144, cappé à 128)', () => {
      expect(getOptimalApiSize(96, 1.5, true)).toBe(128);
    });

    it('retourne 128 pour displaySize=128 (128 * 1.5 = 192, cappé à 128)', () => {
      expect(getOptimalApiSize(128, 1.5, true)).toBe(128);
    });
  });

  describe('avec Retina activé et DPR 3x (cappé à 2x)', () => {
    it('retourne 64 pour displaySize=32 avec DPR 3x (cappé à 2x: 32 * 2 = 64)', () => {
      expect(getOptimalApiSize(32, 3, true)).toBe(64);
    });

    it('retourne 128 pour displaySize=64 avec DPR 3x (cappé à 2x: 64 * 2 = 128)', () => {
      expect(getOptimalApiSize(64, 3, true)).toBe(128);
    });

    it('retourne 128 pour displaySize=96 avec DPR 3x (cappé à 2x: 96 * 2 = 192, cappé à 128)', () => {
      expect(getOptimalApiSize(96, 3, true)).toBe(128);
    });
  });

  describe('clamping des tailles (limites)', () => {
    it('clamp une displaySize inférieure à 32 (Retina off)', () => {
      expect(getOptimalApiSize(10, undefined, false)).toBe(32);
    });

    it('clamp une displaySize supérieure à 128 (Retina off)', () => {
      expect(getOptimalApiSize(200, undefined, false)).toBe(128);
    });

    it('clamp une displaySize inférieure à 32 avec Retina (10 * 2 = 20, clampé à 32 avant DPR → 32 * 2 = 64)', () => {
      // Clamping se fait sur displaySize (10 → 32), puis on applique DPR: 32 * 2 = 64
      expect(getOptimalApiSize(10, 2, true)).toBe(64);
    });

    it('clamp une displaySize supérieure à 128 avec Retina (200 * 2 = 400, clampé à 128)', () => {
      expect(getOptimalApiSize(200, 2, true)).toBe(128);
    });
  });

  describe('avec DPR auto-détecté (pas de paramètre dpr)', () => {
    beforeEach(() => {
      vi.stubGlobal('window', { devicePixelRatio: 2 });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('utilise le DPR du navigateur si non fourni (auto-détection)', () => {
      // Avec DPR 2x: displaySize=32 * 2 = 64
      expect(getOptimalApiSize(32, undefined, true)).toBe(64);
    });

    it('utilise le DPR du navigateur pour une taille de 64 (64 * 2 = 128)', () => {
      expect(getOptimalApiSize(64, undefined, true)).toBe(128);
    });
  });

  describe('cas limites et edge cases', () => {
    it('retourne toujours une ApiSize valide (32, 64, 96 ou 128)', () => {
      const validSizes = [32, 64, 96, 128];
      for (let size = 32; size <= 128; size += 5) {
        const result = getOptimalApiSize(size, 1, true);
        expect(validSizes).toContain(result);
      }
    });

    it('arrondit toujours vers le haut pour éviter l\'upscaling', () => {
      // displaySize=33 * 1 = 33, devrait arrondir à 64 (pas 32)
      expect(getOptimalApiSize(33, 1, true)).toBe(64);
      // displaySize=65 * 1 = 65, devrait arrondir à 96 (pas 64)
      expect(getOptimalApiSize(65, 1, true)).toBe(96);
      // displaySize=97 * 1 = 97, devrait arrondir à 128 (pas 96)
      expect(getOptimalApiSize(97, 1, true)).toBe(128);
    });

    it('gère correctement les tailles fractionnaires', () => {
      expect(getOptimalApiSize(63.7, 1, true)).toBe(64);
      expect(getOptimalApiSize(64.3, 1, true)).toBe(96);
    });
  });
});
