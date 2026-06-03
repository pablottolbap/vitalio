import { useState } from 'react';
import Select from 'react-select';
import { useLanguage } from '../i18n.jsx';
import { useTheme, selectStyles } from '../theme.jsx';
import { languageName } from '../languages.js';
import Flag from './Flag';

/**
 * FilterPanel component for filtering video/podcast library.
 * Provides controls for filtering by topics (tags), channels, guests/people, series, and language.
 * @param {Object} props - Component props
 * @param {string[]} props.uniqueTopics - Available topics/tags
 * @param {string|null} props.activeTopic - Currently selected topic
 * @param {Function} props.setActiveTopic - Callback to change active topic
 * @param {string[]} props.uniqueChannels - Available channel names
 * @param {string|null} props.activeChannel - Currently selected channel
 * @param {Function} props.setActiveChannel - Callback to change active channel
 * @param {string[]} props.uniquePeople - Available guest/person names
 * @param {string|null} props.activePerson - Currently selected person
 * @param {Function} props.setActivePerson - Callback to change active person
 * @param {string[]} props.uniqueSeries - Available series names
 * @param {string|null} props.activeSeries - Currently selected series
 * @param {Function} props.setActiveSeries - Callback to change active series
 * @param {string[]} props.uniqueLanguages - Available language codes
 * @param {string|null} props.activeLanguage - Currently selected language
 * @param {Function} props.setActiveLanguage - Callback to change active language
 * @param {Function} props.getChannelDisplayName - Helper to format channel names for display
 * @param {Function} props.getPersonDisplayName - Helper to format person names for display
 * @param {Function} props.onClearAll - Callback when clear all button is clicked
 * @returns {React.ReactElement} - Filter panel UI
 */
export default function FilterPanel({
  uniqueTopics, activeTopic, setActiveTopic,
  uniqueChannels, activeChannel, setActiveChannel,
  uniquePeople, activePerson, setActivePerson,
  uniqueSeries, activeSeries, setActiveSeries,
  uniqueLanguages, activeLanguage, setActiveLanguage,
  getChannelDisplayName, getPersonDisplayName,
  onClearAll
}) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const rsStyles = selectStyles(theme);
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Topics pagination: show first 8 by default, then allow "Show All" expansion
  const visibleTopics = showAllTopics ? uniqueTopics : uniqueTopics.slice(0, 8);

  const channelOptions = (uniqueChannels || []).map(channel => ({
    value: channel,
    label: getChannelDisplayName(channel)
  }));

  const personOptions = (uniquePeople|| []).map(person => ({
    value: person,
    label: getPersonDisplayName(person)
  }));

  const seriesOptions = (uniqueSeries || []).map(series => ({
    value: series,
    label: series
  }));

  const languageToOption = (code) => ({
    value: code,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Flag code={code} size={18} /> {languageName(code, lang)}
      </span>
    )
  });
  const languageOptions = (uniqueLanguages || []).map(languageToOption);

  return (
    <section style={{ background: theme.panel, padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>

      {/* Topics/tags filter section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95em', color: theme.boldText, fontWeight: 'bold' }}>🏷️ {t('filterByTag')}</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {visibleTopics.map(topic => (
            <button
              key={topic}
              onClick={() => setActiveTopic(activeTopic === topic ? null : topic)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: activeTopic === topic ? `2px solid ${theme.boldText}` : `1px solid ${theme.borderStrong}`,
                cursor: 'pointer',
                background: activeTopic === topic ? theme.boldText : theme.card,
                color: activeTopic === topic ? '#fff' : theme.text,
                fontSize: '0.85em',
                fontWeight: activeTopic === topic ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              #{topic}
            </button>
          ))}

          {uniqueTopics.length > 8 && (
            <button
              onClick={() => setShowAllTopics(!showAllTopics)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.link,
                cursor: 'pointer',
                fontSize: '0.85em',
                textDecoration: 'underline',
                padding: '6px 10px'
              }}
            >
              {showAllTopics ? t('showLess') : `+ ${t('showAll')} (${uniqueTopics.length})`}
            </button>
          )}
        </div>
      </div>

      {/* 3-column grid for channels, people, and series dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Channels dropdown */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.boldText, fontWeight: 'bold' }}>📺 {t('filterByChannel')}</h4>
          <Select
            styles={rsStyles}
            options={channelOptions}
            isClearable={true}
            placeholder={t('searchChannel')}
            value={activeChannel ? { value: activeChannel, label: getChannelDisplayName(activeChannel) } : null}
            onChange={(selectedOption) => setActiveChannel(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => t('channelNotFound')}
          />
        </div>

        {/* People/guests dropdown */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.boldText, fontWeight: 'bold' }}>👤 {t('filterByPerson')}</h4>
          <Select
            styles={rsStyles}
            options={personOptions}
            isClearable={true}
            placeholder={t('searchPerson')}
            value={activePerson ? { value: activePerson, label: getPersonDisplayName(activePerson) } : null}
            onChange={(selectedOption) => setActivePerson(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => t('personNotFound')}
          />
        </div>

        {/* Series dropdown */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.boldText, fontWeight: 'bold' }}>📚 {t('filterBySeries')}</h4>
          <Select
            styles={rsStyles}
            options={seriesOptions}
            isClearable={true}
            placeholder={t('searchSeries')}
            value={activeSeries ? { value: activeSeries, label: activeSeries } : null}
            onChange={(selectedOption) => setActiveSeries(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => t('seriesNotFound')}
          />
        </div>

        {/* Content language dropdown */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.boldText, fontWeight: 'bold' }}>🌐 {t('filterByLanguage')}</h4>
          <Select
            styles={rsStyles}
            options={languageOptions}
            isClearable={true}
            placeholder={t('searchLanguage')}
            value={activeLanguage ? languageToOption(activeLanguage) : null}
            onChange={(selectedOption) => setActiveLanguage(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => t('languageNotFound')}
          />
        </div>
      </div>

      {/* Clear button (shows only when at least one filter is active) */}
      {(activeChannel || activePerson || activeTopic || activeSeries || activeLanguage) && (
        <div style={{ marginTop: '20px', borderTop: `1px solid ${theme.border}`, paddingTop: '15px' }}>
          <button
            onClick={onClearAll}
            style={{
              background: '#dc3545', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ❌ {t('clearFilters')}
          </button>
        </div>
      )}
    </section>
  );
}