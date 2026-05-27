import React, { useState } from 'react';
import Select from 'react-select';

export default function FilterPanel({ 
  uniqueTopics, activeTopic, setActiveTopic,
  uniqueChannels, activeChannel, setActiveChannel,
  uniquePeople, activePerson, setActivePerson,
  uniqueSeries, activeSeries, setActiveSeries,
  getChannelDisplayName, getPersonDisplayName,
  onClearAll
}) {
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

  return (
    <section style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      
      {/* Sekcja Tematów */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95em', color: '#555' }}>🏷️ Filter by tag:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {visibleTopics.map(topic => (
            <button 
              key={topic}
              onClick={() => setActiveTopic(activeTopic === topic ? null : topic)}
              style={{
                padding: '6px 14px', 
                borderRadius: '20px', 
                border: activeTopic === topic ? '2px solid #6f42c1' : '1px solid #ccc', 
                cursor: 'pointer',
                background: activeTopic === topic ? '#6f42c1' : '#fff',
                color: activeTopic === topic ? '#FFF' : '#333',
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
                color: '#007BFF',
                cursor: 'pointer',
                fontSize: '0.85em',
                textDecoration: 'underline',
                padding: '6px 10px'
              }}
            >
              {showAllTopics ? 'Show less' : `+ Show all (${uniqueTopics.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Grid z 3 kolumnami dla Kanałów, Osób i Serii */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* Dropdown dla Kanałów */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: '#555' }}>📺 Filter by channel:</h4>
          <Select
            options={channelOptions}
            isClearable={true} 
            placeholder="Search for a channel..."
            value={activeChannel ? { value: activeChannel, label: getChannelDisplayName(activeChannel) } : null}
            onChange={(selectedOption) => setActiveChannel(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => "Channel not found"}
          />
        </div>

        {/* Dropdown dla osób */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: '#555' }}>👤 Filter by person:</h4>
          <Select
            options={personOptions}
            isClearable={true}
            placeholder="Enter name and surname..."
            value={activePerson ? { value: activePerson, label: getPersonDisplayName(activePerson) } : null}
            onChange={(selectedOption) => setActivePerson(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => "Person not found"}
          />
        </div>

        {/* Dropdown dla Serii */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95em', color: '#555' }}>📚 Filter by series:</h4>
          <Select
            options={seriesOptions}
            isClearable={true}
            placeholder="Search for a series..."
            value={activeSeries ? { value: activeSeries, label: activeSeries } : null}
            onChange={(selectedOption) => setActiveSeries(selectedOption ? selectedOption.value : null)}
            noOptionsMessage={() => "Series not found"}
          />
        </div>
      </div>

      {/* Przycisk czyszczenia (uwzględnia też activeSeries) */}
      {(activeChannel || activePerson || activeTopic || activeSeries) && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <button 
            onClick={onClearAll} 
            style={{ 
              background: '#dc3545', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ❌ Clear all filters
          </button>
        </div>
      )}
    </section>
  );
}