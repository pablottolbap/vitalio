
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, useTheme, selectStyles, themes } from './theme.jsx';

function ThemeConsumer() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="mode">{isDark ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
  });

  it('defaults to light mode', () => {
    renderTheme();
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('toggleTheme switches light → dark', () => {
    renderTheme();
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('toggleTheme switches dark → light on second click', () => {
    renderTheme();
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('applies body backgroundColor on mount', () => {
    renderTheme();
    expect(document.body.style.backgroundColor).toBeTruthy();
  });

  it('updates body backgroundColor when switching to dark', () => {
    renderTheme();
    const lightBg = document.body.style.backgroundColor;
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(document.body.style.backgroundColor).not.toBe(lightBg);
  });

  it('defaults to dark mode when prefers-color-scheme is dark', () => {
    // Stub localStorage to have no saved preference so matchMedia is checked
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    // Stub matchMedia to return matches: true for dark preference
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    try {
      renderTheme();
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('restores saved dark theme from localStorage', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'dark'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    try {
      renderTheme();
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('restores saved light theme from localStorage', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'light'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    try {
      renderTheme();
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('selectStyles', () => {
  it('returns a function for every react-select style slot', () => {
    const styles = selectStyles(themes.light);
    ['control', 'menu', 'option', 'singleValue', 'input', 'placeholder',
      'dropdownIndicator', 'clearIndicator', 'indicatorSeparator'].forEach(key => {
      expect(typeof styles[key]).toBe('function');
    });
  });

  it('control applies accent border and boxShadow when focused', () => {
    const result = selectStyles(themes.light).control({}, { isFocused: true });
    expect(result.borderColor).toBe(themes.light.accent);
    expect(result.boxShadow).toContain(themes.light.accent);
  });

  it('control uses borderStrong and no boxShadow when not focused', () => {
    const result = selectStyles(themes.light).control({}, { isFocused: false });
    expect(result.borderColor).toBe(themes.light.borderStrong);
    expect(result.boxShadow).toBe('none');
  });

  it('option uses accent background for selected state', () => {
    const result = selectStyles(themes.light).option({}, { isSelected: true, isFocused: false });
    expect(result.backgroundColor).toBe(themes.light.accent);
    expect(result.color).toBe('#fff');
  });

  it('option uses panel background when focused but not selected', () => {
    const result = selectStyles(themes.light).option({}, { isSelected: false, isFocused: true });
    expect(result.backgroundColor).toBe(themes.light.panel);
    expect(result.color).toBe(themes.light.text);
  });

  it('option uses card background in default state', () => {
    const result = selectStyles(themes.light).option({}, { isSelected: false, isFocused: false });
    expect(result.backgroundColor).toBe(themes.light.card);
    expect(result.color).toBe(themes.light.text);
  });

  it('remaining slots pass base through with theme colors (dark theme)', () => {
    const styles = selectStyles(themes.dark);
    expect(styles.menu({})).toMatchObject({ backgroundColor: themes.dark.card });
    expect(styles.singleValue({})).toMatchObject({ color: themes.dark.text });
    expect(styles.input({})).toMatchObject({ color: themes.dark.text });
    expect(styles.placeholder({})).toMatchObject({ color: themes.dark.muted });
    expect(styles.dropdownIndicator({})).toMatchObject({ color: themes.dark.muted });
    expect(styles.clearIndicator({})).toMatchObject({ color: themes.dark.muted });
    expect(styles.indicatorSeparator({})).toMatchObject({ backgroundColor: themes.dark.border });
  });
});

describe('ThemeProvider — error handling', () => {
  it('defaults to light mode when localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    renderTheme();
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    vi.unstubAllGlobals();
  });

  it('defaults to light mode when localStorage returns invalid value', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'invalid-mode'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    renderTheme();
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    vi.unstubAllGlobals();
  });

  it('defaults to light mode when matchMedia throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal('matchMedia', () => { throw new Error('matchMedia blocked'); });
    renderTheme();
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    vi.unstubAllGlobals();
  });

  it('handles localStorage error on toggle', () => {
    renderTheme();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => { throw new Error('localStorage blocked'); }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    // Should still toggle even if localStorage fails
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    vi.unstubAllGlobals();
  });
});
