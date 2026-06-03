import { useState, useEffect, useRef } from 'react';
import rawData from './data.json';
import FilterPanel from './components/FilterPanel';
import VideoCard from './components/VideoCard';
import Flag from './components/Flag';
import StatsPanel from './components/StatsPanel';
import ContributionForm from './components/ContributionForm';
import logo from './assets/logo.png';
import { useLanguage } from './i18n.jsx';
import { useTheme } from './theme.jsx';

// Local mock data (test-only) — this file is git-ignored and absent in production.
// import.meta.glob with eager:true only loads it if it exists, so a CI build
// (without this file) simply skips the mock and does not pollute data.json.
const mockModules = import.meta.glob('./mock.local.json', { eager: true });
const mockData = Object.values(mockModules).flatMap(mod => mod.default || []);
const allData = [...rawData, ...mockData];

/**
 * Fisher-Yates shuffle — randomizes array order in-place.
 * @param {Array} arr - Array to shuffle
 * @returns {Array} - New shuffled copy of the array
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Main App component — displays filtered video/podcast library with sidebar and contribution form
 * @returns {React.ReactElement}
 */
export default function App() {
  const { lang, setLang, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();

  // Filter states
  /** @type {[string|null, Function]} - Currently selected channel author name */
  const [activeChannel, setActiveChannel] = useState(null);
  /** @type {[string|null, Function]} - Currently selected guest/person */
  const [activePerson, setActivePerson] = useState(null);
  /** @type {[string|null, Function]} - Currently selected topic */
  const [activeTopic, setActiveTopic] = useState(null);
  /** @type {[string|null, Function]} - Currently selected series name */
  const [activeSeries, setActiveSeries] = useState(null);
  /** @type {[string|null, Function]} - Currently selected language code (PL/EN) */
  const [activeLanguage, setActiveLanguage] = useState(null);
  /** @type {[boolean, Function]} - Whether contribution form dialog is open */
  const [showContribute, setShowContribute] = useState(false);
  /** @type {[string|null, Function]} - Active sort key: 'author' | 'title' | 'series' | null (random) */
  const [activeSort, setActiveSort] = useState(null);
  /** @type {['asc'|'desc', Function]} - Sort direction */
  const [sortDirection, setSortDirection] = useState('asc');
  /** @type {[Array, Function]} - Shuffled copy of allData, stable for the session */
  const [baseData] = useState(() => shuffleArray(allData));

  // Infinite scroll state
  /** @type {[number, Function]} - Number of items visible (for lazy loading) */
  const [visibleCount, setVisibleCount] = useState(10);
  /** @type {React.MutableRefObject<HTMLDivElement|null>} - Intersection observer anchor element */
  const observerRef = useRef(null);

  // Footer state
  /** @type {[boolean, Function]} - Whether user has scrolled down */
  const [hasScrolled, setHasScrolled] = useState(false);
  /** @type {[boolean, Function]} - Whether to show full footer (vs alternative footer when scrolled) */
  const [showFullFooter, setShowFullFooter] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('reset') && params.get('reset') === '1') {
      try {
        localStorage.removeItem('vitalio-ui-lang');
        localStorage.removeItem('vitalio-theme');
      } catch {
        // localStorage access error — continue anyway
      }
      window.history.replaceState(null, '', import.meta.env.BASE_URL);
    }
  }, []);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(10);
  }, [activeTopic, activeChannel, activePerson, activeSeries, activeLanguage]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 200;
      setHasScrolled(scrolled);
      if (scrolled && showFullFooter) {
        setShowFullFooter(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showFullFooter]);

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

  const filteredMaterials = baseData.filter(item => {
    if (activeChannel && item.author.name !== activeChannel) return false;
    if (activePerson && (!item.guests || !item.guests.includes(activePerson))) return false;
    if (activeTopic && (!item.topics || !item.topics.includes(activeTopic))) return false;
    if (activeSeries && item.series?.name !== activeSeries) return false;
    if (activeLanguage && item.language !== activeLanguage) return false;
    return true;
  });

  const sortedMaterials = activeSort
    ? [...filteredMaterials].sort((a, b) => {
        let cmp = 0;
        if (activeSort === 'author') cmp = a.author.name.localeCompare(b.author.name);
        else if (activeSort === 'title') cmp = a.title.localeCompare(b.title);
        else if (activeSort === 'series') cmp = (a.series?.name ?? '').localeCompare(b.series?.name ?? '');
        return sortDirection === 'asc' ? cmp : -cmp;
      })
    : filteredMaterials;

  const displayedMaterials = sortedMaterials.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && visibleCount < sortedMaterials.length) {
        setVisibleCount(prevCount => prevCount + 10);
      }
    }, { threshold: 1.0 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, sortedMaterials.length]);
  const handleClearAll = () => { setActiveChannel(null); setActivePerson(null); setActiveTopic(null); setActiveSeries(null); setActiveLanguage(null); setActiveSort(null); setSortDirection('asc'); };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', color: theme.text }}>

      {/* Control bar: theme toggle + UI language selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>

        {/* Theme toggle button */}
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

        {/* UI language selector (flags) */}
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

      {/* Header with logo */}
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <img src={logo} alt="Vitalio" style={{ width: '400px', maxWidth: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
      </header>

      {/* Main content grid + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Filters and video cards */}
        <div>
          {/* Filter panel */}
          <FilterPanel 
            uniqueTopics={uniqueTopics} activeTopic={activeTopic} setActiveTopic={setActiveTopic}
            uniqueChannels={uniqueChannels} activeChannel={activeChannel} setActiveChannel={setActiveChannel}
            uniquePeople={uniquePeople} activePerson={activePerson} setActivePerson={setActivePerson}
            uniqueSeries={uniqueSeries} activeSeries={activeSeries} setActiveSeries={setActiveSeries}
            uniqueLanguages={uniqueLanguages} activeLanguage={activeLanguage} setActiveLanguage={setActiveLanguage}
            getChannelDisplayName={(c) => c} getPersonDisplayName={(p) => p}
            onClearAll={handleClearAll}
          />

          {/* Sorting controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9em', color: theme.boldText, fontWeight: 'bold' }}>
              {activeSort ? (sortDirection === 'asc' ? '▲' : '▼') : '⬍'} {t('sortBy')}
            </span>
            {['author', 'title', 'series'].map(key => (
              <button
                key={key}
                onClick={() => setActiveSort(activeSort === key ? null : key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${activeSort === key ? theme.boldText : theme.border}`,
                  background: activeSort === key ? theme.boldText : 'transparent',
                  color: activeSort === key ? '#fff' : theme.text,
                  cursor: 'pointer',
                  fontSize: '0.85em',
                }}
              >
                {t(`sort_${key}`)}
              </button>
            ))}
            {activeSort && (
              <button
                onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                title={sortDirection === 'asc' ? 'Descending' : 'Ascending'}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  background: 'transparent',
                  color: theme.text,
                  cursor: 'pointer',
                  fontSize: '0.85em',
                }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            )}
          </div>

          {/* Video/podcast materials list */}
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
          {sortedMaterials.length === 0 && (
            <p style={{ textAlign: 'center', color: theme.muted, marginTop: '40px' }}>{t('noResults')}</p>
          )}

          <div ref={observerRef} style={{ height: '20px', margin: '20px 0' }} />
          <div style={{ height: '200px' }} />
        </div>

        {/* Sidebar: all channels + statistics */}
        <aside style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* All Channels section */}
          <div style={{
            background: theme.sidebar,
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1em', color: theme.boldText }}>
              {t('allChannels')}
            </h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {uniqueChannelsWithUrls.map(channel => (
                <li key={channel.name} style={{ marginBottom: '12px' }}>
                  <div>
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
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <StatsPanel allData={allData} channels={uniqueChannelsWithUrls} />
        </aside>

      </div>

      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: theme.pageBg,
        borderTop: `1px solid ${theme.border}`,
        paddingTop: '8px',
        paddingBottom: '8px',
        textAlign: 'center',
        fontSize: '0.9em',
        zIndex: 100,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px auto 140px 120px',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '6px',
            alignItems: 'center',
            textAlign: 'center',
            lineHeight: '1'
          }}>
            {/* Slot 1: Project site OR Go back on top */}
            <div>
              {hasScrolled && !showFullFooter ? (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: theme.boldText, fontWeight: 'bold', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', width: '100%', lineHeight: '1', display: 'block' }}
                >
                  ⬆️ {t('scrollToTop')}
                </button>
              ) : (
                <a
                  href="https://github.com/pablottolbap/vitalio"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.boldText, textDecoration: 'none', fontWeight: 'bold', display: 'block', lineHeight: '1' }}
                >
                  💻 {t('projectSite')}
                </a>
              )}
            </div>

            {/* Slot 2: Report bug OR empty */}
            <div>
              {!(hasScrolled && !showFullFooter) && (
                <a
                  href="https://github.com/pablottolbap/vitalio/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  🐛 {t('reportBug')}
                </a>
              )}
            </div>

            {/* Slot 3: Suggest content (only in main footer) */}
            <div>
              {!(hasScrolled && !showFullFooter) && (
                <button
                  onClick={() => setShowContribute(true)}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: '#28a745', fontWeight: 'bold', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', width: '100%', lineHeight: '1', display: 'block' }}
                >
                  💡 {t('reportContent')}
                </button>
              )}
            </div>

            {/* Slot 4: Hide footer OR Show footer OR empty */}
            <div>
              {hasScrolled && !showFullFooter ? (
                <button
                  onClick={() => setShowFullFooter(true)}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: theme.text, fontWeight: 'bold', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', width: '100%', lineHeight: '1', display: 'block' }}
                >
                  {t('showFooter')}
                </button>
              ) : hasScrolled && showFullFooter ? (
                <button
                  onClick={() => setShowFullFooter(false)}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: theme.text, fontWeight: 'bold', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', width: '100%', lineHeight: '1', display: 'block' }}
                >
                  {t('hideFooter')}
                </button>
              ) : null}
            </div>
          </div>

          <p style={{ margin: '0px', fontSize: '0.75em', color: theme.faint }}>
            {t('copyright')}
          </p>
        </div>
      </footer>

      <ContributionForm open={showContribute} onClose={() => setShowContribute(false)} />
    </div>
  );
}