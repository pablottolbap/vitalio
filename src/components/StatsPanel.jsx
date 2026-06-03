import { useLanguage } from '../i18n.jsx';
import { useTheme } from '../theme.jsx';

/**
 * StatsPanel displays aggregate statistics about the materials database.
 * Computes counts at render time from allData without making network calls.
 * @param {Object} props - Component props
 * @param {Object[]} props.allData - All materials in the database
 * @param {Object[]} props.channels - Unique channels with their URLs
 * @returns {React.ReactElement} - Statistics display panel
 */
export default function StatsPanel({ allData, channels }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Count total guests (deduplicated across all materials)
  const totalGuests = new Set(
    allData.flatMap(item => item.guests ?? [])
  ).size;

  // Count total series (deduplicated)
  const totalSeries = new Set(
    allData
      .filter(item => item.series)
      .map(item => item.series.name)
  ).size;

  // Count by type
  const byType = allData.reduce(
    (acc, item) => {
      const type = item.type ?? 'video';
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    },
    { video: 0, podcast: 0, qa: 0 }
  );

  // Count by language
  const byLanguage = allData.reduce(
    (acc, item) => {
      const lang = item.language ?? 'EN';
      acc[lang] = (acc[lang] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const statRow = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', padding: '4px 0' }}>
      <span>{label}</span>
      <strong style={{ color: theme.boldText }}>{value}</strong>
    </div>
  );

  return (
    <div style={{
      border: `1px solid ${theme.border}`,
      padding: '15px',
      borderRadius: '8px',
      background: theme.card,
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: theme.boldText, fontWeight: 700 }}>
        {t('stats')}
      </h3>

      <div style={{ fontSize: '0.85em', lineHeight: 1.8 }}>
        {/* Totals section */}
        {statRow(t('statsMaterials'), allData.length)}
        {statRow(t('statsChannels'), channels.length)}
        {statRow(t('statsGuests'), totalGuests)}
        {statRow(t('statsSeries'), totalSeries)}

        <div style={{ borderTop: `1px solid ${theme.border}`, margin: '8px 0' }} />

        {/* By type section */}
        <div style={{ fontWeight: 700, marginBottom: '8px', color: theme.boldText }}>
          {t('statsByType')}
        </div>
        {statRow('🎥 Video', byType.video)}
        {statRow('🎙️ Podcast', byType.podcast)}
        {statRow('🙋 Q&A', byType.qa)}

        <div style={{ borderTop: `1px solid ${theme.border}`, margin: '8px 0' }} />

        {/* By language section */}
        <div style={{ fontWeight: 700, marginBottom: '8px', color: theme.boldText }}>
          {t('statsByLanguage')}
        </div>
        {Object.entries(byLanguage)
          .sort((a, b) => b[1] - a[1])
          .map(([lang, count]) => (
            <div key={lang}>
              {statRow(lang, count)}
            </div>
          ))}
      </div>
    </div>
  );
}
