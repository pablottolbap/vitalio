
import { useLanguage } from '../i18n.jsx';
import { useTheme } from '../theme.jsx';
import { languageName } from '../languages.js';
import Flag from './Flag';

export default function VideoCard({ item, onChannelClick, onPersonClick, onTopicClick, onSeriesClick, onLanguageClick }) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const linkStyle = { color: theme.link, cursor: 'pointer', textDecoration: 'underline' };

  return (
    <div style={{ border: `1px solid ${theme.border}`, padding: '15px', borderRadius: '8px', background: theme.card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <h2 style={{ marginTop: 0 }}>
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
        <strong>{t('channel')}:</strong>{' '}
        <span style={linkStyle} onClick={() => onChannelClick(item.author.name)}>
          {item.author.name}
        </span>
      </p>

      {item.guests && item.guests.length > 0 && (
        <p style={{ margin: '5px 0' }}>
          <strong>{t('guests')}: </strong>
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
          <strong>{t('series')}: </strong>
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