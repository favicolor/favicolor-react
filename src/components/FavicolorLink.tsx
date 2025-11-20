import React from 'react';
import { FavicolorInlineIcon } from './FavicolorInlineIcon';
import { cn } from '../utils';
import type { FavicolorLinkProps } from '../types';

/**
 * Composant FavicolorLink - Lien avec favicon inline automatique
 *
 * @example
 * ```tsx
 * <FavicolorLink href="https://github.com">
 *   Visitez GitHub
 * </FavicolorLink>
 *
 * <FavicolorLink
 *   href="https://google.com"
 *   iconPosition="right"
 *   className="text-blue-500 hover:underline"
 * >
 *   Rechercher
 * </FavicolorLink>
 * ```
 */
export function FavicolorLink({
  href,
  children,
  iconPosition = 'left',
  showIcon = true,
  className,
  iconClassName,
  iconStyle,
  theme,
  target,
  rel
}: FavicolorLinkProps) {
  const icon = showIcon ? (
    <FavicolorInlineIcon
      url={href}
      className={iconClassName}
      style={{
        marginBottom: '0',  // Annuler le marginBottom de FavicolorInlineIcon
        ...iconStyle        // Permettre les overrides utilisateur
      }}
      theme={theme}
    />
  ) : null;

  return (
    <a
      href={href}
      className={cn("inline-flex items-center", className)}
      target={target}
      rel={rel}
      style={{ gap: '0.375rem', verticalAlign: 'bottom' }}
    >
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </a>
  );
}
