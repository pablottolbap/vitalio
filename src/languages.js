// Pomocniki dla pola `language` materiału (np. "PL", "EN").
// Dotyczy języka TREŚCI, nie języka interfejsu (ten jest w i18n.jsx).

export const LANGUAGE_FLAGS = {
  PL: '🇵🇱',
  EN: '🇬🇧',
};

// Nazwa języka zależna od języka interfejsu (uiLang: 'pl' | 'en').
export const LANGUAGE_NAMES = {
  PL: { pl: 'Polski', en: 'Polish' },
  EN: { pl: 'Angielski', en: 'English' },
};

export function languageFlag(code) {
  return LANGUAGE_FLAGS[code] || '🏳️';
}

export function languageName(code, uiLang) {
  return LANGUAGE_NAMES[code]?.[uiLang] || code;
}
