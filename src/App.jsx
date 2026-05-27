import { useState } from 'react';
import rawData from './data.json'; 
import FilterPanel from './components/FilterPanel';
import VideoCard from './components/VideoCard';

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null);
  const [activePerson, setActivePerson] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);

  const uniqueChannels = [...new Set(rawData.map(item => item.author.name))]
    .sort((a, b) => a.localeCompare(b));
    
  const uniquePeople = [...new Set(rawData.flatMap(item => item.guests || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const uniqueSeries = [...new Set(rawData.map(i => i.series?.name).filter(Boolean))].sort();    

  const uniqueTopics = [...new Set(rawData.flatMap(item => item.topics || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const uniqueChannelsWithUrls = Array.from(
    new Map(rawData.map(item => [item.author.name, item.author.channelUrl])).entries()
  ).map(([name, channelUrl]) => ({ name, channelUrl }))
   .sort((a, b) => a.name.localeCompare(b.name));

  const filteredMaterials = rawData.filter(item => {
      if (activeChannel && item.author.name !== activeChannel) return false;
      if (activePerson && (!item.guests || !item.guests.includes(activePerson))) return false;
      if (activeTopic && (!item.topics || !item.topics.includes(activeTopic))) return false;
      if (activeSeries && item.series?.name !== activeSeries) return false; 
      return true;
  });

  const getPersonDisplayName = (person) => uniqueChannels.includes(person) ? `${person}` : person;
  const getChannelDisplayName = (channel) => uniquePeople.includes(channel) ? `${channel} (channel)` : channel;
  const handleClearAll = () => { setActiveChannel(null); setActivePerson(null); setActiveTopic(null); setActiveSeries(null);};

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* LOGO */}
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <img src="/src/logo.png" alt="Logo" style={{ width: '400px', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
      </header>

      {/* Główna zawartość + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Filtry i Karty */}
        <div>
          {/* PANEL FILTRÓW */}
          <FilterPanel 
            uniqueTopics={uniqueTopics} activeTopic={activeTopic} setActiveTopic={setActiveTopic}
            uniqueChannels={uniqueChannels} activeChannel={activeChannel} setActiveChannel={setActiveChannel}
            uniquePeople={uniquePeople} activePerson={activePerson} setActivePerson={setActivePerson}
            uniqueSeries={uniqueSeries} activeSeries={activeSeries} setActiveSeries={setActiveSeries}
            getChannelDisplayName={getChannelDisplayName} getPersonDisplayName={getPersonDisplayName}
            onClearAll={handleClearAll}
          />

          {/* LISTA MATERIAŁÓW */}
          <main style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {filteredMaterials.map(item => (
              <VideoCard 
                key={item.id} 
                item={item} 
                onChannelClick={setActiveChannel}
                onPersonClick={setActivePerson}
                onTopicClick={setActiveTopic}
                onSeriesClick={setActiveSeries}
              />
            ))}
            
            {filteredMaterials.length === 0 && <p>No results found.</p>}
          </main>
        </div>

        {/* Sidebar "All channels in database" */}
        <aside style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1em', color: '#333' }}>
            All channels in database
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {uniqueChannelsWithUrls.map(channel => (
              <li key={channel.name} style={{ marginBottom: '12px' }}>
                <a 
                  href={channel.channelUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    color: '#007BFF', 
                    textDecoration: 'none',
                    fontSize: '0.95em',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  📺 {channel.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

      </div>
    </div>
  );
}