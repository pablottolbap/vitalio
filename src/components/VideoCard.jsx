// Card component displaying a single video or podcast material with clickable filter tags.
import { useLanguage } from '../i18n.jsx';
import { useTheme } from '../theme.jsx';
import { languageName } from '../languages.js';
import Flag from './Flag';

/**
 * VideoCard displays a single video/podcast material with metadata and clickable filter options.
 * Material title links to the external URL; channel, guests, series, language, and topics are clickable to filter.
 * @param {Object} props - Component props
 * @param {Object} props.item - Material data object
 * @param {string} props.item.id - Unique material ID
 * @param {'video'|'podcast'|'qa'} props.item.type - Material type (determines icon)
 * @param {string} props.item.title - Material title (displayed, clickable to external URL)
 * @param {string} props.item.url - External URL to material
 * @param {string} props.item.language - Language code (e.g., 'PL', 'EN')
 * @param {Object} props.item.author - Author/channel info
 * @param {string} props.item.author.name - Channel name
 * @param {string} props.item.author.channelUrl - Link to channel (not used in card, shown in sidebar)
 * @param {string[]} [props.item.guests] - Array of guest/speaker names
 * @param {Object} [props.item.series] - Series info (if material is part of a series)
 * @param {string} props.item.series.name - Series name
 * @param {number} props.item.series.order - Episode/order number in series
 * @param {string[]} props.item.topics - Tags/topics (filters, clickable, no # prefix)
 * @param {Function} props.onChannelClick - Callback when channel name is clicked
 * @param {Function} props.onPersonClick - Callback when guest/person name is clicked
 * @param {Function} props.onTopicClick - Callback when a topic/tag is clicked
 * @param {Function} props.onSeriesClick - Callback when series name is clicked
 * @param {Function} props.onLanguageClick - Callback when language badge is clicked
 * @returns {React.ReactElement} - Card UI
 */
export default function VideoCard({ item, onChannelClick, onPersonClick, onTopicClick, onSeriesClick, onLanguageClick }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const linkStyle = { color: theme.link, cursor: 'pointer', textDecoration: 'underline' };

  return (
    <div style={{ border: `1px solid ${theme.border}`, padding: '15px', borderRadius: '8px', background: theme.card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <h2 style={{ marginTop: 0 }}>
          {/* Type icon: 🎙️ podcast, 🙋 Q&A, 🎥 video (default) */}
          {item.type === 'podcast' ? '🎙️' : item.type === 'qa' ? '🙋' : '🎥'} <a href={item.url} target="_blank" rel="noreferrer" style={{ color: theme.text }}>{item.title}</a>
        </h2>

        {item.language && (
          <span
            onClick={() => onLanguageClick(item.language)}
            title={languageName(item.language, lang)}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.8em',
              color: theme.text,
              background: theme.badgeBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '3px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            <Flag code={item.language} size={16} /> {item.language}
          </span>
        )}
      </div>

      <p style={{ margin: '5px 0' }}>
        <strong style={{ color: theme.boldText }}>{t('channel')}:</strong>{' '}
        <span style={linkStyle} onClick={() => onChannelClick(item.author.name)}>
          {item.author.name}
        </span>
      </p>

      {item.guests && item.guests.length > 0 && (
        <p style={{ margin: '5px 0' }}>
          <strong style={{ color: theme.boldText }}>{t('guests')}: </strong>
          {item.guests.map((guest, index) => (
            <span key={guest}>
              <span style={linkStyle} onClick={() => onPersonClick(guest)}>{guest}</span>
              {index < item.guests.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}

      {item.series && (
        <p style={{ margin: '5px 0' }}>
          <strong style={{ color: theme.boldText }}>{t('series')}: </strong>
          <span style={{...linkStyle, fontStyle: 'italic'}} onClick={() => onSeriesClick(item.series.name)}>
            {item.series.name}
          </span>
        </p>
      )}

      {item.topics && item.topics.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          {item.topics.map(topic => (
            <span 
              key={topic} 
              onClick={() => onTopicClick(topic)}
              style={{ fontSize: '0.85em', color: theme.accent, cursor: 'pointer', marginRight: '10px', textDecoration: 'underline' }}
            >
              #{topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}