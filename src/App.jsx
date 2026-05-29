import React, { useState, useEffect, useRef } from 'react';
import rawData from './data.json';
import FilterPanel from './components/FilterPanel';
import VideoCard from './components/VideoCard';
import Flag from './components/Flag';
import logo from './assets/logo.png';
import { useLanguage } from './i18n.jsx';
import { useTheme } from './theme.jsx';

// Lokalne dane testowe (mock) — plik jest git-ignorowany i nieobecny na produkcji.
// import.meta.glob z eager:true wczytuje go tylko jeśli istnieje, więc build
// w CI (bez tego pliku) po prostu pomija mocka i nie zanieczyszcza data.json.
const mockModules = import.meta.glob('./mock.local.json', { eager: true });
const mockData = Object.values(mockModules).flatMap(mod => mod.default || []);
const allData = [...rawData, ...mockData];

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const searchParams = new URLSearchParams(window.location.search);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activePerson, setActivePerson] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState(null);

  const [visibleCount, setVisibleCount] = useState(10);
  const observerRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTopic) params.set('topic', activeTopic);
    if (activeChannel) params.set('channel', activeChannel);
    if (activePerson) params.set('person', activePerson);
    if (activeSeries) params.set('series', activeSeries);
    if (activeLanguage) params.set('language', activeLanguage);
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newQuery);
  }, [activeTopic, activeChannel, activePerson, activeSeries, activeLanguage]);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeTopic, activeChannel, activePerson, activeSeries, activeLanguage]);

  const uniqueChannels = [...new Set(allData.map(item => item.author.name))]
    .sort((a, b) => a.localeCompare(b));

  const uniquePeople = [...new Set(allData.flatMap(item => item.guests || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const uniqueSeries = [...new Set(allData.map(i => i.series?.name).filter(Boolean))].sort();

  const uniqueTopics = [...new Set(allData.flatMap(item => item.topics || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const uniqueLanguages = [...new Set(allData.map(item => item.language).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const uniqueChannelsWithUrls = Array.from(
    new Map(allData.map(item => [item.author.name, item.author.channelUrl])).entries()
  ).map(([name, channelUrl]) => ({ name, channelUrl }))
   .sort((a, b) => a.name.localeCompare(b.name));

  const filteredMaterials = allData.filter(item => {
      if (activeChannel && item.author.name !== activeChannel) return false;
      if (activePerson && (!item.guests || !item.guests.includes(activePerson))) return false;
      if (activeTopic && (!item.topics || !item.topics.includes(activeTopic))) return false;
      if (activeSeries && item.series?.name !== activeSeries) return false;
      if (activeLanguage && item.language !== activeLanguage) return false;
      return true;
  });

  const displayedMaterials = filteredMaterials.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && visibleCount < filteredMaterials.length) {
        setVisibleCount(prevCount => prevCount + 10);
      }
    }, { threshold: 1.0 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredMaterials.length]);
  const handleClearAll = () => { setActiveChannel(null); setActivePerson(null); setActiveTopic(null); setActiveSeries(null); setActiveLanguage(null);};

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', color: theme.text }}>

      {/* PASEK STERUJĄCY: motyw + język interfejsu */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>

        {/* Przełącznik motywu */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
          aria-label={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
          style={{
            padding: '4px 10px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '1em',
            lineHeight: 1,
            border: `1px solid ${theme.borderStrong}`,
            background: theme.card,
            color: theme.text,
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Przełącznik języka interfejsu (flagi) */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['pl', 'en'].map(code => (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              aria-label={code.toUpperCase()}
              title={code.toUpperCase()}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px',
                cursor: 'pointer',
                border: lang === code ? `2px solid ${theme.accent}` : `1px solid ${theme.borderStrong}`,
                background: theme.card,
                opacity: lang === code ? 1 : 0.55,
                transition: 'opacity 0.2s',
              }}
            >
              <Flag code={code.toUpperCase()} size={26} />
            </button>
          ))}
        </div>
      </div>

      {/* LOGO */}
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <img src={logo} alt="Vitalio" style={{ width: '400px', maxWidth: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
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
            uniqueLanguages={uniqueLanguages} activeLanguage={activeLanguage} setActiveLanguage={setActiveLanguage}
            getChannelDisplayName={(c) => c} getPersonDisplayName={(p) => p}
            onClearAll={handleClearAll}
          />

          {/* LISTA MATERIAŁÓW */}
          <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {displayedMaterials.map(item => (
              <VideoCard
                key={item.id} 
                item={item} 
                onChannelClick={setActiveChannel}
                onPersonClick={setActivePerson}
                onTopicClick={setActiveTopic}
                onSeriesClick={setActiveSeries}
                onLanguageClick={setActiveLanguage}
              />
            ))}
          </main>
          {filteredMaterials.length === 0 && (
            <p style={{ textAlign: 'center', color: theme.muted, marginTop: '40px' }}>{t('noResults')}</p>
          )}

          <div ref={observerRef} style={{ height: '20px', margin: '20px 0' }} />
          <footer style={{
            marginTop: '60px',
            paddingTop: '20px',
            borderTop: `1px solid ${theme.border}`,
            textAlign: 'center',
            fontSize: '0.9em'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '30px', 
              flexWrap: 'wrap', 
              marginBottom: '15px' 
            }}>
              {/* PAMIĘTAJ: Zmień poniższe adresy URL na linki do Twojego repozytorium! */}
              <a 
                href="https://github.com/pablottolbap/vitalio" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#6f42c1', textDecoration: 'none', fontWeight: 'bold' }}
              >
                💻 {t('projectSite')}
              </a>
              
              <a 
                href="https://github.com/pablottolbap/vitalio/issues" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 'bold' }}
              >
                🐛 {t('reportBug')}
              </a>
              
              <a 
                href="https://github.com/pablottolbap/vitalio/discussions/new?category=new-materials-request" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#28a745', textDecoration: 'none', fontWeight: 'bold' }}
              >
                💡 {t('reportContent')}
              </a>
            </div>
            <p style={{ margin: '0', fontSize: '0.8em', color: theme.faint }}>
              {t('copyright')}
            </p>
          </footer>
        </div>

        {/* Sidebar "All channels in database" */}
        <aside style={{
          background: theme.sidebar,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1em', color: theme.text }}>
            {t('allChannels')}
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {uniqueChannelsWithUrls.map(channel => (
              <li key={channel.name} style={{ marginBottom: '12px' }}>
                <a 
                  href={channel.channelUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{
                    color: theme.link,
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