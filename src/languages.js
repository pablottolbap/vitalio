// Helpers for the `language` field of materials (e.g., "PL", "EN").
// Relates to content language, NOT UI language (which is in i18n.jsx).
// To add a new language: update LANGUAGE_FLAGS, LANGUAGE_NAMES, and add SVG to Flag.jsx.

export const LANGUAGE_FLAGS = {
  PL: '🇵🇱',
  EN: '🇬🇧',
};

// Language name, translated based on UI language (uiLang: 'pl' | 'en').
export const LANGUAGE_NAMES = {
  PL: { pl: 'Polski', en: 'Polish' },
  EN: { pl: 'Angielski', en: 'English' },
};

/**
 * Get the flag emoji for a language code.
 * @param {string} code - Language code (e.g., 'PL', 'EN')
 * @returns {string} Flag emoji, or white flag if code is unknown
 */
export function languageFlag(code) {
  return LANGUAGE_FLAGS[code] || '🏳️';
}

/**
 * Get the localized name of a language.
 * @param {string} code - Language code (e.g., 'PL', 'EN')
 * @param {'pl'|'en'} uiLang - UI language for the name
 * @returns {string} Language name in the given UI language, or code if unknown
 */
export function languageName(code, uiLang) {
  return LANGUAGE_NAMES[code]?.[uiLang] || code;
}
