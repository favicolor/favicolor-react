// Composants
export { FavicolorProvider } from './FavicolorProvider';
export { FavicolorIcon } from './components/FavicolorIcon';
export { FavicolorInlineIcon } from './components/FavicolorInlineIcon';
export { FavicolorLink } from './components/FavicolorLink';

// Hook
export { useFavicolor } from './hooks/useFavicolor';

// Types
export type {
  FavicolorConfig,
  FavicolorSize,
  FavicolorShape,
  FavicolorIconProps,
  FavicolorInlineIconProps,
  FavicolorLinkProps,
  FaviconResponse,
  ExtractedColors
} from './types';

// Utilitaires (optionnel, pour usage avancé)
export {
  extractDomain,
  buildFaviconApiUrl,
  buildImageUrl,
  getCacheKey,
  cn
} from './utils';
