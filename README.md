# @favicolor/react

[![Tests](https://github.com/favicolor/favicolor-react/actions/workflows/test.yml/badge.svg)](https://github.com/favicolor/favicolor-react/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@favicolor/react.svg)](https://www.npmjs.com/package/@favicolor/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

React components to display favicons with their dominant colors automatically extracted via the Favicolor API.

## Installation

```bash
npm install @favicolor/react
# or
yarn add @favicolor/react
# or
pnpm add @favicolor/react
```

## Configuration

Wrap your application with the `FavicolorProvider` to configure the API:

```tsx
import { FavicolorProvider } from '@favicolor/react';

function App() {
  return (
    <FavicolorProvider
      config={{
        apiUrl: 'https://icon.favicolor.com', // Optional, default value
        apiKey: process.env.NEXT_PUBLIC_FAVICOLOR_API_KEY, // For localhost
        appId: process.env.NEXT_PUBLIC_FAVICOLOR_APP_ID, // For production
        defaultTheme: 'dark', // 'light' or 'dark'
        defaultSize: 64, // Size between 32 and 128 pixels
        enableRetina: true, // Enable Retina/HiDPI detection (default: true)
      }}
    >
      <YourApp />
    </FavicolorProvider>
  );
}
```

### Authentication configuration

- **`apiKey`**: Automatically used for requests from localhost (development)
- **`appId`**: Used for requests from registered domains (production)

## Components

### FavicolorIcon

Displays a favicon in a squircle container with extracted colors.

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

**Props:**
- `url` (string, required): Full URL or domain name
- `size` (number, optional): Image size in pixels (between 32 and 128). Automatically rounded to the optimal API size (32, 64, 96 or 128)
- `theme` ('light' | 'dark', optional): Color theme
- `className` (string, optional): Additional CSS classes
- `fallback` (ReactNode, optional): Custom fallback component
- `shape` ('circle' | 'square' | 'squircle' | 'custom' | 'auto', optional): Container shape (default: 'squircle')

### FavicolorInlineIcon

Inline icon with adaptive size in `em` to integrate with text.

```tsx
import { FavicolorInlineIcon } from '@favicolor/react';

function MyText() {
  return (
    <p className="text-lg">
      Visit <FavicolorInlineIcon url="github.com" /> GitHub
    </p>
  );
}
```

**Props:**
- `url` (string, required): Full URL or domain name
- `theme` ('light' | 'dark'): Color theme
- `className` (string): Additional CSS classes
- `style` (CSSProperties): Inline CSS styles (e.g. `{ width: '1.5em' }`)

### FavicolorLink

Link with automatic inline favicon.

```tsx
import { FavicolorLink } from '@favicolor/react';

function MyLinks() {
  return (
    <div>
      <FavicolorLink href="https://github.com">
        Visit GitHub
      </FavicolorLink>

      <FavicolorLink
        href="https://google.com"
        iconPosition="right"
        className="text-blue-500 hover:underline"
      >
        Search
      </FavicolorLink>
    </div>
  );
}
```

**Props:**
- `href` (string, required): Destination URL
- `children` (ReactNode, required): Link content
- `iconPosition` ('left' | 'right'): Icon position (default: 'left')
- `showIcon` (boolean): Show icon (default: true)
- `className` (string): CSS classes for the link
- `iconClassName` (string): CSS classes for the icon
- `iconStyle` (CSSProperties): CSS styles for the icon
- `target` (string): Link target attribute
- `rel` (string): Link rel attribute

## Hook

### useFavicolor

Access Favicolor configuration from context.

```tsx
import { useFavicolor } from '@favicolor/react';

function MyComponent() {
  const config = useFavicolor();
  console.log(config.apiUrl); // 'https://icon.favicolor.com'
  console.log(config.defaultTheme); // 'dark'
}
```

## Features

- ✅ **Flexible sizes**: Accepts any size between 32 and 128 pixels, automatically rounded to the optimal API size
- ✅ **Retina/HiDPI detection**: Automatically loads 2x images on high-resolution screens (Retina, 4K, etc.)
- ✅ **Dynamic DPI detection**: Automatically recalculates the image when the window is moved between screens with different resolutions
- ✅ **Smart caching**: Colors are cached, image URLs are dynamically calculated based on DPR
- ✅ **Graceful fallback**: Displays a globe icon by default if the favicon is not found
- ✅ **Light/dark themes**: Native support for both themes
- ✅ **Strict TypeScript**: Strict typing for all props and interfaces
- ✅ **SSR-safe**: Compatible with Next.js and other SSR frameworks
- ✅ **Adaptive inline**: FavicolorInlineIcon automatically adapts to text size
- ✅ **Comprehensive tests**: 124 unit tests with Vitest

## Retina/HiDPI Optimization

The FavicolorIcon component automatically detects screen resolution (Device Pixel Ratio) and loads optimized images:

### How it works

1. **Automatic detection**: The component detects the screen DPR (`window.devicePixelRatio`)
2. **Smart calculation**: API size is automatically calculated: `displaySize × min(DPR, 2)`
3. **Optimal rounding**: Rounds up to the nearest API size (32, 64, 96, 128) to avoid upscaling
4. **Capped at 2x**: DPR is capped at 2x maximum to optimize bandwidth

### Examples

```tsx
// Standard screen (DPR 1x)
<FavicolorIcon url="github.com" size={64} />
// → Loads a 64×64 pixel image

// Retina screen (DPR 2x)
<FavicolorIcon url="github.com" size={64} />
// → Loads a 128×128 pixel image (64 × 2 = 128)

// 4K screen (DPR 3x, capped at 2x)
<FavicolorIcon url="github.com" size={64} />
// → Loads a 128×128 pixel image (64 × 2 = 128, DPR capped)

// Non-standard size (automatically rounded)
<FavicolorIcon url="github.com" size={72} />
// → On Retina screen: 72 × 2 = 144, rounded to 128px
```

### Disabling Retina detection

If you want to disable Retina detection (e.g., to save bandwidth):

```tsx
<FavicolorProvider
  config={{
    enableRetina: false, // Disables Retina detection
  }}
>
  <App />
</FavicolorProvider>
```

### Dynamic screen change detection

The component automatically listens for resolution changes via `matchMedia`. When you move the window from a standard screen to a Retina screen (or vice versa), the image is automatically recalculated and reloaded.

## Utilities

Utility functions are also exported for advanced usage:

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

// Usage example
const dpr = getDevicePixelRatio(); // 1, 1.5, 2, etc.
const apiSize = getOptimalApiSize(64, dpr, true); // 64, 96 or 128
```

## Development

### Cache

During development, you can clear the client cache via the console:

```javascript
window.clearFavicolorCache();
```

### Tests

```bash
# Run tests
npm test

# Watch mode (automatic re-run)
npm run test:watch

# Interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## License

MIT

## Support

For any questions or issues, visit [https://favicolor.com](https://favicolor.com)
