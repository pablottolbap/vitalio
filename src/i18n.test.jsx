import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider, useLanguage } from './i18n.jsx';

beforeEach(() => {
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  });
});

function LanguageConsumer({ testKey }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="language">{lang}</span>
      <span data-testid="hello">{t(testKey || 'formTitle')}</span>
      <button onClick={() => setLang('en')}>EN</button>
      <button onClick={() => setLang('pl')}>PL</button>
    </div>
  );
}

function renderLanguage(props = {}) {
  return render(
    <LanguageProvider>
      <LanguageConsumer {...props} />
    </LanguageProvider>
  );
}

describe('LanguageProvider', () => {
  it('defaults to Polish language', () => {
    renderLanguage();
    expect(screen.getByTestId('language')).toHaveTextContent('pl');
  });

  it('renders Polish translations by default', () => {
    renderLanguage();
    expect(screen.getByTestId('hello')).toHaveTextContent('Zaproponuj nowy materiał');
  });

  it('switches to English when setLang is called with "en"', () => {
    renderLanguage();
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('hello')).toHaveTextContent('Suggest a new material');
  });

  it('switches back to Polish when setLang is called with "pl"', () => {
    renderLanguage();
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    fireEvent.click(screen.getByRole('button', { name: 'PL' }));
    expect(screen.getByTestId('language')).toHaveTextContent('pl');
    expect(screen.getByTestId('hello')).toHaveTextContent('Zaproponuj nowy materiał');
  });

  it('updates document.documentElement.lang on language change', () => {
    renderLanguage();
    expect(document.documentElement.lang).toBe('pl');
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(document.documentElement.lang).toBe('en');
  });

  it('saves language preference to localStorage', () => {
    renderLanguage();
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(localStorage.getItem('vitalio-ui-lang')).toBe('en');
  });

  it('loads language preference from localStorage on mount', () => {
    localStorage.setItem('vitalio-ui-lang', 'en');
    renderLanguage();
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    localStorage.removeItem('vitalio-ui-lang');
  });

  it('falls back to Polish when localStorage contains invalid language', () => {
    localStorage.setItem('vitalio-ui-lang', 'invalid');
    renderLanguage();
    expect(screen.getByTestId('language')).toHaveTextContent('pl');
    localStorage.removeItem('vitalio-ui-lang');
  });

  it('returns fallback Polish translation for missing keys', () => {
    renderLanguage();
    expect(screen.getByTestId('hello')).toHaveTextContent('Zaproponuj nowy materiał');
  });

  it('returns the key itself when translation missing in all languages', () => {
    renderLanguage({ testKey: 'nonexistent_key_xyz' });
    expect(screen.getByTestId('hello')).toHaveTextContent('nonexistent_key_xyz');
  });

  it('returns Polish fallback when English translation missing but Polish exists', () => {
    renderLanguage({ testKey: 'formTitle' });
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByTestId('hello')).toHaveTextContent('Suggest a new material');
  });
});

describe('LanguageProvider — error handling', () => {
  it('defaults to Polish when localStorage throws on read', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    renderLanguage();
    expect(screen.getByTestId('language')).toHaveTextContent('pl');
    vi.unstubAllGlobals();
  });

  it('gracefully handles localStorage errors on setLang', () => {
    renderLanguage();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'pl'),
      setItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    vi.unstubAllGlobals();
  });
});
