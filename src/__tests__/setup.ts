import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Étendre les matchers de Vitest avec jest-dom
expect.extend(matchers);

// Nettoyage automatique après chaque test
afterEach(() => {
  cleanup();
});
