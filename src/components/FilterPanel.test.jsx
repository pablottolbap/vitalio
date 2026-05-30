import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterPanel from './FilterPanel.jsx';
import { LanguageProvider } from '../i18n.jsx';
import { ThemeProvider } from '../theme.jsx';

// react-select's internal DOM is complex and not under test here.
// Replace it with a minimal native select so the tests stay focused on
// FilterPanel's own logic (topic buttons, clear button, prop wiring).
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

const TOPICS = ['carnivore', 'diet', 'basics', 'keto', 'fasting', 'supplements', 'recipes', 'how_to', 'science'];
const CHANNELS = ['Channel A', 'Channel B'];
const PEOPLE = ['Jan Kowalski'];
const SERIES = ['Series One'];
const LANGUAGES = ['PL', 'EN'];

function renderPanel(overrides = {}) {
  const props = {
    uniqueTopics: TOPICS,
    activeTopic: null,
    setActiveTopic: vi.fn(),
    uniqueChannels: CHANNELS,
    activeChannel: null,
    setActiveChannel: vi.fn(),
    uniquePeople: PEOPLE,
    activePerson: null,
    setActivePerson: vi.fn(),
    uniqueSeries: SERIES,
    activeSeries: null,
    setActiveSeries: vi.fn(),
    uniqueLanguages: LANGUAGES,
    activeLanguage: null,
    setActiveLanguage: vi.fn(),
    getChannelDisplayName: (c) => c,
    getPersonDisplayName: (p) => p,
    onClearAll: vi.fn(),
    ...overrides,
  };
  return {
    ...props,
    ...render(
      <LanguageProvider>
        <ThemeProvider>
          <FilterPanel {...props} />
        </ThemeProvider>
      </LanguageProvider>
    ),
  };
}

describe('FilterPanel — topics', () => {
  it('renders the first 8 topics as buttons', () => {
    renderPanel();
    // 9 topics provided, only 8 visible by default
    TOPICS.slice(0, 8).forEach((topic) => {
      expect(screen.getByRole('button', { name: `#${topic}` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: `#${TOPICS[8]}` })).not.toBeInTheDocument();
  });

  it('calls setActiveTopic with the topic name when a topic button is clicked', () => {
    const { setActiveTopic } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: '#carnivore' }));
    expect(setActiveTopic).toHaveBeenCalledWith('carnivore');
  });

  it('calls setActiveTopic with null when the active topic is clicked again (deselect)', () => {
    const { setActiveTopic } = renderPanel({ activeTopic: 'diet' });
    fireEvent.click(screen.getByRole('button', { name: '#diet' }));
    expect(setActiveTopic).toHaveBeenCalledWith(null);
  });

  it('shows a "show all" button when there are more than 8 topics', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /pokaż wszystkie|show all/i })).toBeInTheDocument();
  });

  it('reveals all topics after clicking "show all"', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /pokaż wszystkie|show all/i }));
    expect(screen.getByRole('button', { name: `#${TOPICS[8]}` })).toBeInTheDocument();
  });

  it('does not show "show all" when there are 8 or fewer topics', () => {
    renderPanel({ uniqueTopics: TOPICS.slice(0, 8) });
    expect(screen.queryByRole('button', { name: /pokaż wszystkie|show all/i })).not.toBeInTheDocument();
  });
});

describe('FilterPanel — clear filters', () => {
  it('does not show the clear button when no filters are active', () => {
    renderPanel();
    expect(screen.queryByRole('button', { name: /wyczyść|clear/i })).not.toBeInTheDocument();
  });

  it('shows the clear button when a topic filter is active', () => {
    renderPanel({ activeTopic: 'diet' });
    expect(screen.getByRole('button', { name: /wyczyść|clear/i })).toBeInTheDocument();
  });

  it('shows the clear button when a channel filter is active', () => {
    renderPanel({ activeChannel: 'Channel A' });
    expect(screen.getByRole('button', { name: /wyczyść|clear/i })).toBeInTheDocument();
  });

  it('shows the clear button when a person filter is active', () => {
    renderPanel({ activePerson: 'Jan Kowalski' });
    expect(screen.getByRole('button', { name: /wyczyść|clear/i })).toBeInTheDocument();
  });

  it('shows the clear button when a series filter is active', () => {
    renderPanel({ activeSeries: 'Series One' });
    expect(screen.getByRole('button', { name: /wyczyść|clear/i })).toBeInTheDocument();
  });

  it('shows the clear button when a language filter is active', () => {
    renderPanel({ activeLanguage: 'PL' });
    expect(screen.getByRole('button', { name: /wyczyść|clear/i })).toBeInTheDocument();
  });

  it('calls onClearAll when the clear button is clicked', () => {
    const { onClearAll } = renderPanel({ activeTopic: 'carnivore' });
    fireEvent.click(screen.getByRole('button', { name: /wyczyść|clear/i }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });
});

describe('FilterPanel — dropdowns', () => {
  it('renders the channel dropdown', () => {
    renderPanel();
    expect(screen.getByRole('combobox', { name: /szukaj kanału|search.*channel/i })).toBeInTheDocument();
  });

  it('renders the person dropdown', () => {
    renderPanel();
    expect(screen.getByRole('combobox', { name: /podaj imię|enter name/i })).toBeInTheDocument();
  });

  it('calls setActiveChannel when a channel is selected', () => {
    const { setActiveChannel } = renderPanel();
    const dropdown = screen.getByRole('combobox', { name: /szukaj kanału|search.*channel/i });
    fireEvent.change(dropdown, { target: { value: 'Channel A' } });
    expect(setActiveChannel).toHaveBeenCalledWith('Channel A');
  });

  it('calls setActiveChannel with null when selection is cleared', () => {
    const { setActiveChannel } = renderPanel({ activeChannel: 'Channel A' });
    const dropdown = screen.getByRole('combobox', { name: /szukaj kanału|search.*channel/i });
    fireEvent.change(dropdown, { target: { value: '' } });
    expect(setActiveChannel).toHaveBeenCalledWith(null);
  });

  it('calls setActivePerson when a person is selected', () => {
    const { setActivePerson } = renderPanel();
    const dropdown = screen.getByRole('combobox', { name: /podaj imię|enter name/i });
    fireEvent.change(dropdown, { target: { value: 'Jan Kowalski' } });
    expect(setActivePerson).toHaveBeenCalledWith('Jan Kowalski');
  });

  it('calls setActivePerson with null when person selection is cleared', () => {
    const { setActivePerson } = renderPanel({ activePerson: 'Jan Kowalski' });
    const dropdown = screen.getByRole('combobox', { name: /podaj imię|enter name/i });
    fireEvent.change(dropdown, { target: { value: '' } });
    expect(setActivePerson).toHaveBeenCalledWith(null);
  });

  it('renders the series dropdown', () => {
    renderPanel();
    expect(screen.getByRole('combobox', { name: /szukaj serii|search.*series/i })).toBeInTheDocument();
  });

  it('calls setActiveSeries when a series is selected', () => {
    const { setActiveSeries } = renderPanel();
    const dropdown = screen.getByRole('combobox', { name: /szukaj serii|search.*series/i });
    fireEvent.change(dropdown, { target: { value: 'Series One' } });
    expect(setActiveSeries).toHaveBeenCalledWith('Series One');
  });

  it('calls setActiveSeries with null when series selection is cleared', () => {
    const { setActiveSeries } = renderPanel({ activeSeries: 'Series One' });
    const dropdown = screen.getByRole('combobox', { name: /szukaj serii|search.*series/i });
    fireEvent.change(dropdown, { target: { value: '' } });
    expect(setActiveSeries).toHaveBeenCalledWith(null);
  });

  it('renders the language dropdown', () => {
    renderPanel();
    expect(screen.getByRole('combobox', { name: /wybierz język|select.*language/i })).toBeInTheDocument();
  });

  it('calls setActiveLanguage when a language is selected', () => {
    const { setActiveLanguage } = renderPanel();
    const dropdown = screen.getByRole('combobox', { name: /wybierz język|select.*language/i });
    fireEvent.change(dropdown, { target: { value: 'PL' } });
    expect(setActiveLanguage).toHaveBeenCalledWith('PL');
  });

  it('calls setActiveLanguage with null when language selection is cleared', () => {
    const { setActiveLanguage } = renderPanel({ activeLanguage: 'PL' });
    const dropdown = screen.getByRole('combobox', { name: /wybierz język|select.*language/i });
    fireEvent.change(dropdown, { target: { value: '' } });
    expect(setActiveLanguage).toHaveBeenCalledWith(null);
  });
});

describe('FilterPanel — "show all" / "show less" for topics', () => {
  it('toggles between "show all" and "show less"', () => {
    renderPanel();
    const showAllBtn = screen.getByRole('button', { name: /pokaż wszystkie|show all/i });
    fireEvent.click(showAllBtn);
    expect(screen.getByRole('button', { name: /pokaż mniej|show less/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pokaż wszystkie|show all/i })).not.toBeInTheDocument();
  });

  it('hides topics again after clicking "show less"', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /pokaż wszystkie|show all/i }));
    expect(screen.getByRole('button', { name: `#${TOPICS[8]}` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /pokaż mniej|show less/i }));
    expect(screen.queryByRole('button', { name: `#${TOPICS[8]}` })).not.toBeInTheDocument();
  });
});
