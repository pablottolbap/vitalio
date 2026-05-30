import { useState } from 'react';
import Select from 'react-select';
import { useLanguage } from '../i18n.jsx';
import { useTheme, selectStyles } from '../theme.jsx';
import { languageName } from '../languages.js';
import Flag from './Flag';

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

      {/* Sekcja Tematów */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95em', color: theme.heading }}>🏷️ {t('filterByTag')}</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {visibleTopics.map(topic => (
            <button
              key={topic}
              onClick={() => setActiveTopic(activeTopic === topic ? null : topic)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: activeTopic === topic ? `2px solid ${theme.accent}` : `1px solid ${theme.borderStrong}`,
                cursor: 'pointer',
                background: activeTopic === topic ? theme.accent : theme.card,
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

      {/* Grid z 3 kolumnami dla Kanałów, Osób i Serii */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Dropdown dla Kanałów */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.heading }}>📺 {t('filterByChannel')}</h4>
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

        {/* Dropdown dla osób */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.heading }}>👤 {t('filterByPerson')}</h4>
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

        {/* Dropdown dla Serii */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.heading }}>📚 {t('filterBySeries')}</h4>
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

        {/* Dropdown dla języka materiału */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: theme.heading }}>🌐 {t('filterByLanguage')}</h4>
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

      {/* Przycisk czyszczenia (uwzględnia wszystkie aktywne filtry) */}
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