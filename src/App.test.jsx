import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageProvider } from './i18n.jsx';
import { ThemeProvider } from './theme.jsx';
import App from './App.jsx';

vi.mock('./data.json', () => ({
  default: [
    {
      id: 'v1', type: 'video', title: 'Video One',
      url: 'https://www.youtube.com/watch?v=aaaaaaaaaaaa', language: 'PL',
      author: { name: 'Channel A', channelUrl: 'https://www.youtube.com/@channela' },
      topics: ['carnivore', 'diet'], guests: [], series: null,
    },
    {
      id: 'v2', type: 'podcast', title: 'Podcast Two',
      url: 'https://www.youtube.com/watch?v=bbbbbbbbbbbb', language: 'EN',
      author: { name: 'Channel B', channelUrl: 'https://www.youtube.com/@channelb' },
      topics: ['fasting'], guests: ['Jan Kowalski'], series: null,
    },
    {
      id: 'v3', type: 'video', title: 'Video Three',
      url: 'https://www.youtube.com/watch?v=cccccccccccc', language: 'PL',
      author: { name: 'Channel A', channelUrl: 'https://www.youtube.com/@channela' },
      topics: ['keto'], guests: [], series: { name: 'Series One', order: 1 },
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `pad${i + 4}`,
      type: 'video',
      title: `Padding Item ${i + 4}`,
      url: `https://www.youtube.com/watch?v=padding${i + 4}xxxxx`,
      language: 'PL',
      author: { name: 'Channel A', channelUrl: 'https://www.youtube.com/@channela' },
      topics: ['padding'],
      guests: [],
      series: null,
    })),
  ],
}));

vi.mock('./components/ContributionForm', () => ({
  default: ({ open, onClose }) =>
    open ? (
      <div role="dialog" aria-label="contribution-form">
        <button onClick={onClose}>Close form</button>
      </div>
    ) : null,
}));

vi.mock('react-select', () => ({
  default: ({ onChange, placeholder, options, value }) => (
    <select
      aria-label={placeholder}
      value={value?.value ?? ''}
      onChange={(e) => {
        const opt = options.find((o) => o.value === e.target.value) ?? null;
        onChange(opt);
      }}
    >
      <option value="">--</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {typeof o.label === 'string' ? o.label : o.value}
        </option>
      ))}
    </select>
  ),
}));

function renderApp() {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  );
}

beforeEach(() => {
  global.IntersectionObserver = class {
    observe = vi.fn();
    disconnect = vi.fn();
  };
});

describe('App — structure', () => {
  it('renders the logo', () => {
    renderApp();
    expect(screen.getByAltText('Vitalio')).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /tryb jasny|tryb ciemny/i })).toBeInTheDocument();
  });

  it('renders PL and EN language switcher buttons', () => {
    renderApp();
    expect(screen.getByRole('button', { name: 'PL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('renders the first 10 cards from the data fixture', () => {
    renderApp();
    expect(screen.getByText('Video One')).toBeInTheDocument();
    expect(screen.getByText('Podcast Two')).toBeInTheDocument();
    expect(screen.getByText('Video Three')).toBeInTheDocument();
    expect(screen.getByText('Padding Item 10')).toBeInTheDocument();
    expect(screen.queryByText('Padding Item 11')).not.toBeInTheDocument();
  });

  it('renders the channel sidebar listing all unique channels', () => {
    renderApp();
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByText(/Channel A/)).toBeInTheDocument();
    expect(within(sidebar).getByText(/Channel B/)).toBeInTheDocument();
  });
});

describe('App — language switcher', () => {
  it('clicking EN switches the UI to English', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByText(/all channels in database/i)).toBeInTheDocument();
  });

  it('clicking back to PL restores Polish UI', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    fireEvent.click(screen.getByRole('button', { name: 'PL' }));
    expect(screen.getByText(/wszystkie kanały w bazie/i)).toBeInTheDocument();
  });
});

describe('App — filtering', () => {
  it('filters cards when a topic button is clicked', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: '#carnivore' }));
    expect(screen.getByText('Video One')).toBeInTheDocument();
    expect(screen.queryByText('Podcast Two')).not.toBeInTheDocument();
    expect(screen.queryByText('Video Three')).not.toBeInTheDocument();
  });

  it('shows "no results" message when combined filters match nothing', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: '#fasting' }));
    const channelSelect = screen.getByRole('combobox', { name: /szukaj kanału/i });
    fireEvent.change(channelSelect, { target: { value: 'Channel A' } });
    expect(screen.getByText(/brak wyników|no results/i)).toBeInTheDocument();
  });

  it('clear button resets all active filters', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: '#carnivore' }));
    expect(screen.queryByText('Podcast Two')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /wyczyść|clear/i }));
    expect(screen.getByText('Podcast Two')).toBeInTheDocument();
    expect(screen.getByText('Video Three')).toBeInTheDocument();
  });

  it('updates URL params when a topic filter is applied', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: '#carnivore' }));
    expect(replaceState).toHaveBeenCalledWith(null, '', expect.stringContaining('topic=carnivore'));
  });

  it('removes filter params from URL after clearing all filters', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: '#carnivore' }));
    fireEvent.click(screen.getByRole('button', { name: /wyczyść|clear/i }));
    const lastArg = replaceState.mock.calls.at(-1)[2];
    expect(lastArg).not.toContain('topic=');
  });
});

describe('App — infinite scroll', () => {
  it('loads more cards when the sentinel element intersects the viewport', () => {
    let ioCb;
    global.IntersectionObserver = class {
      constructor(cb) { ioCb = cb; }
      observe = vi.fn();
      disconnect = vi.fn();
    };

    renderApp();
    expect(screen.queryByText('Padding Item 11')).not.toBeInTheDocument();

    act(() => { ioCb([{ isIntersecting: true }]); });

    expect(screen.getByText('Padding Item 11')).toBeInTheDocument();
  });

  it('does not increase visibleCount when sentinel is not intersecting', () => {
    let ioCb;
    global.IntersectionObserver = class {
      constructor(cb) { ioCb = cb; }
      observe = vi.fn();
      disconnect = vi.fn();
    };

    renderApp();
    act(() => { ioCb([{ isIntersecting: false }]); });
    expect(screen.queryByText('Padding Item 11')).not.toBeInTheDocument();
  });
});

describe('App — sidebar link hover', () => {
  it('channel link underlines on mouseenter and restores on mouseleave', () => {
    renderApp();
    const link = screen.getByRole('link', { name: /channel a/i });
    fireEvent.mouseEnter(link);
    expect(link.style.textDecoration).toBe('underline');
    fireEvent.mouseLeave(link);
    expect(link.style.textDecoration).toBe('none');
  });
});

describe('App — person filter', () => {
  it('filters cards when a person (guest) button is clicked', () => {
    renderApp();
    const guestSelect = screen.getByRole('combobox', { name: /podaj imię|enter name/i });
    fireEvent.change(guestSelect, { target: { value: 'Jan Kowalski' } });
    expect(screen.getByText('Podcast Two')).toBeInTheDocument();
    expect(screen.queryByText('Video One')).not.toBeInTheDocument();
    expect(screen.queryByText('Video Three')).not.toBeInTheDocument();
  });

  it('hides items without guests when a person filter is applied', () => {
    renderApp();
    const guestSelect = screen.getByRole('combobox', { name: /podaj imię|enter name/i });
    fireEvent.change(guestSelect, { target: { value: 'Jan Kowalski' } });
    expect(screen.queryByText('Padding Item 4')).not.toBeInTheDocument();
  });
});

describe('App — series filter', () => {
  it('filters cards by series when series dropdown is used', () => {
    renderApp();
    const seriesSelect = screen.getByRole('combobox', { name: /szukaj serii|search.*series/i });
    fireEvent.change(seriesSelect, { target: { value: 'Series One' } });
    expect(screen.getByText('Video Three')).toBeInTheDocument();
    expect(screen.queryByText('Video One')).not.toBeInTheDocument();
    expect(screen.queryByText('Podcast Two')).not.toBeInTheDocument();
  });

  it('hides items without series when series filter is applied', () => {
    renderApp();
    const seriesSelect = screen.getByRole('combobox', { name: /szukaj serii|search.*series/i });
    fireEvent.change(seriesSelect, { target: { value: 'Series One' } });
    expect(screen.queryByText('Padding Item 4')).not.toBeInTheDocument();
  });
});

describe('App — language filter', () => {
  it('filters cards by language when language dropdown is used', () => {
    renderApp();
    const langSelect = screen.getByRole('combobox', { name: /wybierz język|select.*language/i });
    fireEvent.change(langSelect, { target: { value: 'EN' } });
    expect(screen.getByText('Podcast Two')).toBeInTheDocument();
    expect(screen.queryByText('Video One')).not.toBeInTheDocument();
    expect(screen.queryByText('Video Three')).not.toBeInTheDocument();
  });
});

describe('App — multiple filters combined', () => {
  it('resets visibleCount to 10 when filters change', () => {
    let ioCb;
    global.IntersectionObserver = class {
      constructor(cb) { ioCb = cb; }
      observe = vi.fn();
      disconnect = vi.fn();
    };

    renderApp();
    act(() => { ioCb([{ isIntersecting: true }]); });
    expect(screen.getByText('Padding Item 11')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '#carnivore' }));
    expect(screen.queryByText('Padding Item 11')).not.toBeInTheDocument();
  });
});

describe('App — ContributionForm', () => {
  it('does not show ContributionForm on initial render', () => {
    renderApp();
    expect(screen.queryByRole('dialog', { name: 'contribution-form' })).not.toBeInTheDocument();
  });

  it('opens ContributionForm when footer "Suggest content" button is clicked', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /zaproponuj treść|suggest content/i }));
    expect(screen.getByRole('dialog', { name: 'contribution-form' })).toBeInTheDocument();
  });

  it('closes ContributionForm when onClose is called', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /zaproponuj treść|suggest content/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    expect(screen.queryByRole('dialog', { name: 'contribution-form' })).not.toBeInTheDocument();
  });
});
