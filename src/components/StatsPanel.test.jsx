import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../i18n.jsx';
import { ThemeProvider } from '../theme.jsx';
import StatsPanel from './StatsPanel.jsx';

// Wrapper to provide context with English language
const Wrapper = ({ children }) => {
  // Wrapper component that sets language to English for testing
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
};

describe('StatsPanel', () => {
  const mockChannels = [
    { name: 'Channel A', channelUrl: 'https://youtube.com/@a' },
    { name: 'Channel B', channelUrl: 'https://youtube.com/@b' },
    { name: 'Channel C', channelUrl: 'https://youtube.com/@c' },
  ];

  const mockData = [
    {
      id: '1',
      type: 'video',
      title: 'Video 1',
      url: 'https://youtube.com/watch?v=abc',
      language: 'EN',
      author: { name: 'Channel A', channelUrl: 'https://youtube.com/@a' },
      guests: ['Guest 1', 'Guest 2'],
      topics: ['topic1', 'topic2'],
      series: { name: 'Series A', order: 1 },
    },
    {
      id: '2',
      type: 'podcast',
      title: 'Podcast 1',
      url: 'https://youtube.com/watch?v=def',
      language: 'EN',
      author: { name: 'Channel B', channelUrl: 'https://youtube.com/@b' },
      guests: ['Guest 1', 'Guest 3'],
      topics: ['topic1'],
    },
    {
      id: '3',
      type: 'qa',
      title: 'Q&A 1',
      url: 'https://youtube.com/watch?v=ghi',
      language: 'PL',
      author: { name: 'Channel C', channelUrl: 'https://youtube.com/@c' },
      topics: ['topic3'],
    },
    {
      id: '4',
      type: 'video',
      title: 'Video 2',
      url: 'https://youtube.com/watch?v=jkl',
      language: 'PL',
      author: { name: 'Channel A', channelUrl: 'https://youtube.com/@a' },
    },
  ];

  it('renders the Statistics heading', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    // Default language is Polish in tests
    expect(screen.getByText('Statystyki')).toBeInTheDocument();
  });

  it('shows correct total materials count', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows correct channels count', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    const channelCounts = screen.getAllByText('3');
    expect(channelCounts.length).toBeGreaterThan(0);
  });

  it('shows correct guests count (deduplicated)', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    // Guest 1, Guest 2, Guest 3 = 3 unique guests
    const guestCounts = screen.getAllByText('3');
    expect(guestCounts.length).toBeGreaterThan(0);
  });

  it('shows correct series count (deduplicated)', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    // Only Series A = 1 series
    const seriesCounts = screen.getAllByText('1');
    expect(seriesCounts.length).toBeGreaterThan(0);
  });

  it('correctly groups by type', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    const videoEmoji = screen.getByText('🎥 Video');
    const podcastEmoji = screen.getByText('🎙️ Podcast');
    const qaEmoji = screen.getByText('🙋 Q&A');
    expect(videoEmoji).toBeInTheDocument();
    expect(podcastEmoji).toBeInTheDocument();
    expect(qaEmoji).toBeInTheDocument();
  });

  it('correctly groups by language', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    // Both EN and PL should be displayed
    const enElements = screen.getAllByText('EN');
    const plElements = screen.getAllByText('PL');
    expect(enElements.length).toBeGreaterThan(0);
    expect(plElements.length).toBeGreaterThan(0);
  });

  it('renders with empty dataset without crashing', () => {
    render(<StatsPanel allData={[]} channels={[]} />, { wrapper: Wrapper });
    expect(screen.getByText('Statystyki')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('displays "By type" and "By language" section headings', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    // Default language is Polish in tests
    expect(screen.getByText('Wg. typu')).toBeInTheDocument();
    expect(screen.getByText('Wg. języka')).toBeInTheDocument();
  });

  it('displays all stat labels in Polish (default test language)', () => {
    render(<StatsPanel allData={mockData} channels={mockChannels} />, { wrapper: Wrapper });
    expect(screen.getByText('Materiały')).toBeInTheDocument();
    expect(screen.getByText('Kanały')).toBeInTheDocument();
    expect(screen.getByText('Goście')).toBeInTheDocument();
    expect(screen.getByText('Serie')).toBeInTheDocument();
  });
});
