
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VideoCard from './VideoCard.jsx';
import { LanguageProvider } from '../i18n.jsx';
import { ThemeProvider } from '../theme.jsx';

function renderCard(item, handlers = {}) {
  const {
    onChannelClick = vi.fn(),
    onPersonClick = vi.fn(),
    onTopicClick = vi.fn(),
    onSeriesClick = vi.fn(),
    onLanguageClick = vi.fn(),
  } = handlers;
  return {
    onChannelClick,
    onPersonClick,
    onTopicClick,
    onSeriesClick,
    onLanguageClick,
    ...render(
      <LanguageProvider>
        <ThemeProvider>
          <VideoCard
            item={item}
            onChannelClick={onChannelClick}
            onPersonClick={onPersonClick}
            onTopicClick={onTopicClick}
            onSeriesClick={onSeriesClick}
            onLanguageClick={onLanguageClick}
          />
        </ThemeProvider>
      </LanguageProvider>
    ),
  };
}

const BASE_ITEM = {
  id: 'test-1',
  type: 'video',
  title: 'Test Video Title',
  url: 'https://www.youtube.com/watch?v=abc123',
  language: 'PL',
  author: { name: 'Test Channel', channelUrl: 'https://www.youtube.com/@testchannel' },
  topics: ['diet', 'carnivore'],
  guests: [],
  series: null,
};

describe('VideoCard', () => {
  it('renders the video title as a link', () => {
    renderCard(BASE_ITEM);
    const link = screen.getByRole('link', { name: /Test Video Title/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', BASE_ITEM.url);
  });

  it('renders the channel name', () => {
    renderCard(BASE_ITEM);
    expect(screen.getByText('Test Channel')).toBeInTheDocument();
  });

  it('renders topics with # prefix', () => {
    renderCard(BASE_ITEM);
    expect(screen.getByText('#diet')).toBeInTheDocument();
    expect(screen.getByText('#carnivore')).toBeInTheDocument();
  });

  it('renders the language badge', () => {
    renderCard(BASE_ITEM);
    expect(screen.getByText('PL')).toBeInTheDocument();
  });

  it('does not render guests section when guests list is empty', () => {
    renderCard(BASE_ITEM);
    expect(screen.queryByText(/Goście/)).not.toBeInTheDocument();
  });

  it('renders guests when present', () => {
    const item = { ...BASE_ITEM, guests: ['Jan Kowalski', 'Anna Nowak'] };
    renderCard(item);
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
  });

  it('renders series when present', () => {
    const item = { ...BASE_ITEM, series: { name: 'Carnivore Basics', order: 1 } };
    renderCard(item);
    expect(screen.getByText('Carnivore Basics')).toBeInTheDocument();
  });

  it('does not render series section when series is null', () => {
    renderCard(BASE_ITEM);
    expect(screen.queryByText(/Seria/)).not.toBeInTheDocument();
  });

  it('calls onChannelClick when channel name is clicked', () => {
    const { onChannelClick } = renderCard(BASE_ITEM);
    fireEvent.click(screen.getByText('Test Channel'));
    expect(onChannelClick).toHaveBeenCalledWith('Test Channel');
  });

  it('calls onTopicClick when a topic is clicked', () => {
    const { onTopicClick } = renderCard(BASE_ITEM);
    fireEvent.click(screen.getByText('#diet'));
    expect(onTopicClick).toHaveBeenCalledWith('diet');
  });

  it('calls onPersonClick when a guest is clicked', () => {
    const item = { ...BASE_ITEM, guests: ['Jan Kowalski'] };
    const { onPersonClick } = renderCard(item);
    fireEvent.click(screen.getByText('Jan Kowalski'));
    expect(onPersonClick).toHaveBeenCalledWith('Jan Kowalski');
  });

  it('calls onSeriesClick when series name is clicked', () => {
    const item = { ...BASE_ITEM, series: { name: 'Carnivore Basics', order: 1 } };
    const { onSeriesClick } = renderCard(item);
    fireEvent.click(screen.getByText('Carnivore Basics'));
    expect(onSeriesClick).toHaveBeenCalledWith('Carnivore Basics');
  });

  it('calls onLanguageClick when language badge is clicked', () => {
    const { onLanguageClick } = renderCard(BASE_ITEM);
    fireEvent.click(screen.getByText('PL'));
    expect(onLanguageClick).toHaveBeenCalledWith('PL');
  });

  it('shows the video icon (🎥) for type video', () => {
    const { container } = renderCard(BASE_ITEM);
    expect(container.querySelector('h2')?.textContent).toContain('🎥');
  });

  it('shows the podcast icon (🎙️) for type podcast', () => {
    const item = { ...BASE_ITEM, type: 'podcast' };
    const { container } = renderCard(item);
    expect(container.querySelector('h2')?.textContent).toContain('🎙️');
  });

  it('shows the QA icon (🙋) for type qa', () => {
    const item = { ...BASE_ITEM, type: 'qa' };
    const { container } = renderCard(item);
    expect(container.querySelector('h2')?.textContent).toContain('🙋');
  });
});
