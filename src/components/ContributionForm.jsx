import React, { useState, useEffect } from 'react';
import { Turnstile } from 'react-turnstile';
import { useLanguage } from '../i18n.jsx';
import { useTheme } from '../theme.jsx';
import Flag from './Flag';

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY';
const DISCUSSION_URL = 'https://github.com/pablottolbap/vitalio/discussions/new?category=new-materials-request';
const TURNSTILE_SITE_KEY = '0x4AAAAAADYW-mr1tIn3QxNR';
const STORAGE_KEY_SUBMISSIONS = 'vitalio-form-submissions';
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const EMPTY = {
  type: 'video',
  title: '',
  url: '',
  language: 'PL',
  authorName: '',
  authorChannelUrl: '',
  guests: '',
  topics: '',
  seriesName: '',
  seriesOrder: '',
  email: '',
};

const splitList = (value) =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

const getSubmissionsToday = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!stored) return [];
    const submissions = JSON.parse(stored);
    const today = new Date().toDateString();
    return submissions.filter(date => new Date(date).toDateString() === today);
  } catch {
    return [];
  }
};

const recordSubmission = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS) || '[]';
    const submissions = JSON.parse(stored);
    submissions.push(new Date().toISOString());
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions.slice(-50)));
  } catch {
    // ignore localStorage errors
  }
};

export default function ContributionForm({ open, onClose }) {
  const { t } = useLanguage();
  const { theme, isDark } = useTheme();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error | daily_limit
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);

  // Check daily limit when form opens
  useEffect(() => {
    if (open) {
      const todaySubmissions = getSubmissionsToday();
      setDailyLimitReached(todaySubmissions.length >= 5);
    }
  }, [open]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const buildEntry = () => ({
    type: form.type,
    title: form.title.trim(),
    url: form.url.trim(),
    language: form.language,
    author: {
      name: form.authorName.trim(),
      channelUrl: form.authorChannelUrl.trim(),
    },
    guests: splitList(form.guests),
    topics: splitList(form.topics),
    series: form.seriesName.trim()
      ? { name: form.seriesName.trim(), order: Number(form.seriesOrder) || 1 }
      : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (e.target.botcheck && e.target.botcheck.checked) return;
    if (!IS_LOCALHOST && !turnstileToken) {
      setStatus('error');
      return;
    }

    setStatus('sending');

    const entry = buildEntry();
    const payload = {
      access_key: ACCESS_KEY,
      subject: `Vitalio — nowy materiał: ${entry.title || '(bez tytułu)'}`,
      from_name: 'Vitalio',
      replyto: form.email.trim() || undefined,
      message: JSON.stringify(entry, null, 2),
    };

    // Only add Turnstile token in production
    if (!IS_LOCALHOST && turnstileToken) {
      payload['cf-turnstile-response'] = turnstileToken;
    }

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        recordSubmission();
        setStatus('success');
        setForm(EMPTY);
        setTurnstileToken(null);
        setCooldown(30);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const labelStyle = { display: 'block', fontSize: '0.85em', fontWeight: 'bold', color: theme.heading, marginBottom: '4px' };
  const hintStyle = { fontWeight: 'normal', color: theme.muted };
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    borderRadius: '6px',
    border: `1px solid ${theme.borderStrong}`,
    background: theme.card,
    color: theme.text,
    fontSize: '0.9em',
  };
  const fieldStyle = { marginBottom: '14px' };
  const privacyStyle = {
    fontSize: '0.8em',
    color: theme.muted,
    marginBottom: '16px',
    padding: '10px',
    borderLeft: `3px solid ${theme.borderStrong}`,
    borderRadius: '4px',
    background: theme.panel,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 16px', overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('formTitle')}
        style={{
          width: '100%', maxWidth: '560px',
          background: theme.pageBg, color: theme.text,
          border: `1px solid ${theme.border}`, borderRadius: '10px',
          padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.3em' }}>💡 {t('formTitle')}</h2>
          <button
            onClick={onClose}
            aria-label={t('close')}
            style={{ background: 'transparent', border: 'none', color: theme.muted, fontSize: '1.4em', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <p style={{ marginTop: 0, color: theme.muted, fontSize: '0.9em' }}>{t('formIntro')}</p>

        {dailyLimitReached && !status.includes('success') ? (
          <div style={{ padding: '16px', borderRadius: '8px', background: theme.panel, textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px 0' }}>⏳ {t('formDailyLimit')}</p>
            <button
              onClick={onClose}
              style={{ background: theme.accent, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {t('close')}
            </button>
          </div>
        ) : status === 'success' ? (
          <div style={{ padding: '16px', borderRadius: '8px', background: theme.panel, textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px 0' }}>✅ {t('formSuccess')}</p>
            <button
              onClick={onClose}
              style={{ background: theme.accent, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />

            <div style={privacyStyle}>
              🔒 {t('formPrivacy')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t('fldType')}</label>
                <select value={form.type} onChange={set('type')} style={inputStyle}>
                  <option value="video">🎥 video</option>
                  <option value="podcast">🎙️ podcast</option>
                  <option value="qa">🙋 Q&A</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t('fldLanguage')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['PL', 'EN'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, language: code }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: form.language === code ? `2px solid ${theme.accent}` : `1px solid ${theme.borderStrong}`,
                        background: form.language === code ? theme.accent : theme.card,
                        color: form.language === code ? '#fff' : theme.text,
                        cursor: 'pointer',
                        fontWeight: form.language === code ? 'bold' : 'normal',
                        fontSize: '0.9em',
                      }}
                    >
                      <Flag code={code} size={18} />
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('fldTitle')}</label>
              <input type="text" required value={form.title} onChange={set('title')} style={inputStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('fldUrl')}</label>
              <input type="url" required placeholder="https://www.youtube.com/watch?v=..." value={form.url} onChange={set('url')} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t('fldChannelName')}</label>
                <input type="text" required value={form.authorName} onChange={set('authorName')} style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t('fldChannelUrl')}</label>
                <input type="url" required placeholder="https://www.youtube.com/@..." value={form.authorChannelUrl} onChange={set('authorChannelUrl')} style={inputStyle} />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('fldTopics')} <span style={hintStyle}>({t('fldTopicsHint')})</span></label>
              <input type="text" required placeholder="diet, carnivore, basics" value={form.topics} onChange={set('topics')} style={inputStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('fldGuests')} <span style={hintStyle}>({t('optional')}, {t('fldGuestsHint')})</span></label>
              <input type="text" placeholder="Jan Kowalski, Anna Nowak" value={form.guests} onChange={set('guests')} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t('fldSeriesName')} <span style={hintStyle}>({t('optional')})</span></label>
                <input type="text" value={form.seriesName} onChange={set('seriesName')} style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>{t('fldSeriesOrder')} <span style={hintStyle}>({t('optional')})</span></label>
                <input type="number" min="1" value={form.seriesOrder} onChange={set('seriesOrder')} style={inputStyle} />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('fldEmail')} <span style={hintStyle}>({t('optional')})</span></label>
              <input type="email" value={form.email} onChange={set('email')} style={inputStyle} />
            </div>

            {!IS_LOCALHOST && (
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <Turnstile
                  sitekey={TURNSTILE_SITE_KEY}
                  onVerify={(token) => setTurnstileToken(token)}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            )}
            {IS_LOCALHOST && (
              <p style={{ fontSize: '0.85em', color: theme.muted, textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }}>
                🔓 Turnstile skipped in development mode
              </p>
            )}

            {status === 'error' && (
              <p style={{ color: '#dc3545', fontSize: '0.85em', margin: '0 0 12px 0' }}>⚠️ {t('formError')}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || cooldown > 0 || (!IS_LOCALHOST && !turnstileToken)}
              style={{
                width: '100%', padding: '10px', borderRadius: '6px', border: 'none',
                background: theme.accent, color: '#fff', fontWeight: 'bold', fontSize: '0.95em',
                cursor: (status === 'sending' || cooldown > 0 || (!IS_LOCALHOST && !turnstileToken)) ? 'not-allowed' : 'pointer',
                opacity: (status === 'sending' || cooldown > 0 || (!IS_LOCALHOST && !turnstileToken)) ? 0.6 : 1,
              }}
            >
              {cooldown > 0
                ? `${t('formSubmit')} (${cooldown}s)`
                : status === 'sending'
                ? t('formSending')
                : t('formSubmit')}
            </button>

            <p style={{ textAlign: 'center', marginBottom: 0, marginTop: '14px', fontSize: '0.85em' }}>
              <a href={DISCUSSION_URL} target="_blank" rel="noopener noreferrer" style={{ color: theme.link }}>
                {t('formOrDiscussion')}
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
