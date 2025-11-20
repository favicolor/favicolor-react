# @favicolor/react

[![Tests](https://github.com/favicolor/favicolor-react/actions/workflows/test.yml/badge.svg)](https://github.com/favicolor/favicolor-react/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@favicolor/react.svg)](https://www.npmjs.com/package/@favicolor/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

Composants React pour afficher des favicons avec leurs couleurs dominantes extraites automatiquement via l'API Favicolor.

## Installation

```bash
npm install @favicolor/react
# ou
yarn add @favicolor/react
# ou
pnpm add @favicolor/react
```

## Configuration

Wrappez votre application avec le `FavicolorProvider` pour configurer l'API :

```tsx
import { FavicolorProvider } from '@favicolor/react';

function App() {
  return (
    <FavicolorProvider
      config={{
        apiUrl: 'https://icon.favicolor.com', // Optionnel, valeur par défaut
        apiKey: process.env.NEXT_PUBLIC_FAVICOLOR_API_KEY, // Pour localhost
        appId: process.env.NEXT_PUBLIC_FAVICOLOR_APP_ID, // Pour production
        defaultTheme: 'dark', // 'light' ou 'dark'
        defaultSize: 64, // Taille entre 32 et 128 pixels
        enableRetina: true, // Active la détection Retina/HiDPI (défaut: true)
      }}
    >
      <YourApp />
    </FavicolorProvider>
  );
}
```

### Configuration de l'authentification

- **`apiKey`** : Utilisée automatiquement pour les requêtes depuis localhost (développement)
- **`appId`** : Utilisée pour les requêtes depuis des domaines enregistrés (production)

## Composants

### FavicolorIcon

Affiche un favicon dans un conteneur squircle avec les couleurs extraites.

```tsx
import { FavicolorIcon } from '@favicolor/react';

function MyComponent() {
  return (
    <FavicolorIcon
      url="https://github.com"
      size={64}
      theme="dark"
      className="hover:scale-110 transition-transform"
    />
  );
}
```

**Props :**
- `url` (string, requis) : URL complète ou nom de domaine
- `size` (number, optionnel) : Taille de l'image en pixels (entre 32 et 128). Arrondie automatiquement à la taille d'API optimale (32, 64, 96 ou 128)
- `theme` ('light' | 'dark', optionnel) : Thème des couleurs
- `className` (string, optionnel) : Classes CSS additionnelles
- `fallback` (ReactNode, optionnel) : Composant de fallback personnalisé
- `shape` ('circle' | 'square' | 'squircle' | 'custom' | 'auto', optionnel) : Forme du conteneur (défaut: 'squircle')

### FavicolorInlineIcon

Icône inline avec taille adaptative en `em` pour s'intégrer au texte.

```tsx
import { FavicolorInlineIcon } from '@favicolor/react';

function MyText() {
  return (
    <p className="text-lg">
      Visitez <FavicolorInlineIcon url="github.com" /> GitHub
    </p>
  );
}
```

**Props :**
- `url` (string, requis) : URL complète ou nom de domaine
- `theme` ('light' | 'dark') : Thème des couleurs
- `className` (string) : Classes CSS additionnelles
- `style` (CSSProperties) : Styles CSS inline (ex: `{ width: '1.5em' }`)

### FavicolorLink

Lien avec favicon inline automatique.

```tsx
import { FavicolorLink } from '@favicolor/react';

function MyLinks() {
  return (
    <div>
      <FavicolorLink href="https://github.com">
        Visitez GitHub
      </FavicolorLink>

      <FavicolorLink
        href="https://google.com"
        iconPosition="right"
        className="text-blue-500 hover:underline"
      >
        Rechercher
      </FavicolorLink>
    </div>
  );
}
```

**Props :**
- `href` (string, requis) : URL de destination
- `children` (ReactNode, requis) : Contenu du lien
- `iconPosition` ('left' | 'right') : Position de l'icône (défaut: 'left')
- `showIcon` (boolean) : Afficher l'icône (défaut: true)
- `className` (string) : Classes CSS pour le lien
- `iconClassName` (string) : Classes CSS pour l'icône
- `iconStyle` (CSSProperties) : Styles CSS pour l'icône
- `target` (string) : Attribut target du lien
- `rel` (string) : Attribut rel du lien

## Hook

### useFavicolor

Accède à la configuration Favicolor depuis le contexte.

```tsx
import { useFavicolor } from '@favicolor/react';

function MyComponent() {
  const config = useFavicolor();
  console.log(config.apiUrl); // 'https://icon.favicolor.com'
  console.log(config.defaultTheme); // 'dark'
}
```

## Fonctionnalités

- ✅ **Tailles flexibles** : Accepte n'importe quelle taille entre 32 et 128 pixels, arrondie automatiquement à la taille d'API optimale
- ✅ **Détection Retina/HiDPI** : Charge automatiquement des images 2x sur les écrans haute résolution (Retina, 4K, etc.)
- ✅ **Dynamic DPI detection** : Recalcule l'image automatiquement quand la fenêtre est déplacée entre des écrans de résolutions différentes
- ✅ **Cache intelligent** : Les couleurs sont mises en cache, les URLs d'images sont calculées dynamiquement selon le DPR
- ✅ **Fallback élégant** : Affiche une icône globe par défaut si le favicon est introuvable
- ✅ **Thèmes light/dark** : Support natif des deux thèmes
- ✅ **TypeScript strict** : Typage strict pour toutes les props et interfaces
- ✅ **SSR-safe** : Compatible avec Next.js et autres frameworks SSR
- ✅ **Inline adaptative** : FavicolorInlineIcon s'adapte automatiquement à la taille du texte
- ✅ **Tests complets** : 124 tests unitaires avec Vitest

## Optimisation Retina/HiDPI

Le composant FavicolorIcon détecte automatiquement la résolution de l'écran (Device Pixel Ratio) et charge des images optimisées :

### Comment ça fonctionne ?

1. **Détection automatique** : Le composant détecte le DPR de l'écran (`window.devicePixelRatio`)
2. **Calcul intelligent** : La taille d'API est calculée automatiquement : `displaySize × min(DPR, 2)`
3. **Arrondi optimal** : Arrondi vers le haut à la taille d'API la plus proche (32, 64, 96, 128) pour éviter l'upscaling
4. **Cap à 2x** : Le DPR est cappé à 2x maximum pour optimiser la bande passante

### Exemples

```tsx
// Écran standard (DPR 1x)
<FavicolorIcon url="github.com" size={64} />
// → Charge une image 64×64 pixels

// Écran Retina (DPR 2x)
<FavicolorIcon url="github.com" size={64} />
// → Charge une image 128×128 pixels (64 × 2 = 128)

// Écran 4K (DPR 3x, cappé à 2x)
<FavicolorIcon url="github.com" size={64} />
// → Charge une image 128×128 pixels (64 × 2 = 128, DPR cappé)

// Taille non standard (arrondie automatiquement)
<FavicolorIcon url="github.com" size={72} />
// → Sur écran Retina : 72 × 2 = 144, arrondi à 128px
```

### Désactiver la détection Retina

Si vous souhaitez désactiver la détection Retina (par exemple pour économiser la bande passante) :

```tsx
<FavicolorProvider
  config={{
    enableRetina: false, // Désactive la détection Retina
  }}
>
  <App />
</FavicolorProvider>
```

### Détection dynamique du changement d'écran

Le composant écoute automatiquement les changements de résolution via `matchMedia`. Quand vous déplacez la fenêtre d'un écran standard vers un écran Retina (ou vice-versa), l'image est automatiquement recalculée et rechargée.

## Utilitaires

Des fonctions utilitaires sont également exportées pour usage avancé :

```tsx
import {
  extractDomain,
  buildFaviconApiUrl,
  buildImageUrl,
  getCacheKey,
  cn,
  getDevicePixelRatio,
  getOptimalApiSize,
} from '@favicolor/react';

// Exemple d'utilisation
const dpr = getDevicePixelRatio(); // 1, 1.5, 2, etc.
const apiSize = getOptimalApiSize(64, dpr, true); // 64, 96 ou 128
```

## Développement

### Cache

En développement, vous pouvez vider le cache client via la console :

```javascript
window.clearFavicolorCache();
```

### Tests

```bash
# Lancer les tests
npm test

# Mode watch (relance automatique)
npm run test:watch

# Interface UI interactive
npm run test:ui

# Générer le rapport de couverture
npm run test:coverage
```

## Licence

MIT

## Support

Pour toute question ou problème, visitez [https://favicolor.com](https://favicolor.com)
