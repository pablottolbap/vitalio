import { describe, it, expect, afterEach, vi } from 'vitest';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from './storage.js';

describe('Storage utility functions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('safeLocalStorageGet', () => {
    it('returns stored value when key exists', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => 'test-value'),
      });
      expect(safeLocalStorageGet('test-key')).toBe('test-value');
    });

    it('returns fallback when key does not exist', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
      });
      expect(safeLocalStorageGet('nonexistent-key', 'fallback')).toBe('fallback');
    });

    it('returns null as fallback by default', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
      });
      expect(safeLocalStorageGet('nonexistent-key')).toBeNull();
    });

    it('handles localStorage error and returns fallback', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      });
      expect(safeLocalStorageGet('any-key', 'fallback')).toBe('fallback');
    });
  });

  describe('safeLocalStorageSet', () => {
    it('sets value in localStorage and returns true', () => {
      vi.stubGlobal('localStorage', {
        setItem: vi.fn(),
      });
      const result = safeLocalStorageSet('test-key', 'test-value');
      expect(result).toBe(true);
    });

    it('handles localStorage error and returns false', () => {
      vi.stubGlobal('localStorage', {
        setItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      });
      const result = safeLocalStorageSet('key', 'value');
      expect(result).toBe(false);
    });

    it('handles quota exceeded error gracefully', () => {
      vi.stubGlobal('localStorage', {
        setItem: vi.fn(() => { throw new Error('QuotaExceededError'); }),
      });
      const result = safeLocalStorageSet('key', 'value');
      expect(result).toBe(false);
    });
  });

  describe('safeLocalStorageRemove', () => {
    it('removes item from localStorage and returns true', () => {
      vi.stubGlobal('localStorage', {
        removeItem: vi.fn(),
      });
      const result = safeLocalStorageRemove('test-key');
      expect(result).toBe(true);
    });

    it('returns true even when removing nonexistent key', () => {
      vi.stubGlobal('localStorage', {
        removeItem: vi.fn(),
      });
      const result = safeLocalStorageRemove('nonexistent-key');
      expect(result).toBe(true);
    });

    it('handles localStorage error and returns false', () => {
      vi.stubGlobal('localStorage', {
        removeItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      });
      const result = safeLocalStorageRemove('key');
      expect(result).toBe(false);
    });
  });
});
