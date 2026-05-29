import React, { createContext, useContext, useState, useEffect } from 'react';

// Lekki, bezzależnościowy system tłumaczeń interfejsu (PL/EN).
// Tłumaczy WYŁĄCZNIE elementy interfejsu — tytuły materiałów pozostają
// w swoim oryginalnym języku.

const translations = {
  pl: {
    tagline: 'Agregator i wyszukiwarka materiałów wideo oraz podcastów.',
    allChannels: 'Wszystkie kanały w bazie',
    noResults: 'Brak wyników dla tych filtrów.',
    projectSite: 'Strona projektu',
    reportBug: 'Zgłoś błąd',
    reportContent: 'Zaproponuj treść',
    copyright: '© 2026 pablottolbap. Wszelkie prawa zastrzeżone. Wykonano z ❤️ przy użyciu React, Vite i GitHub Pages.',
    filterByTag: 'Filtruj po tagu:',
    filterByChannel: 'Filtruj po kanale:',
    filterByPerson: 'Filtruj po osobie:',
    filterBySeries: 'Filtruj po serii:',
    filterByLanguage: 'Filtruj po języku:',
    searchChannel: 'Szukaj kanału...',
    searchPerson: 'Podaj imię i nazwisko...',
    searchSeries: 'Szukaj serii...',
    searchLanguage: 'Wybierz język...',
    channelNotFound: 'Nie znaleziono kanału',
    personNotFound: 'Nie znaleziono osoby',
    seriesNotFound: 'Nie znaleziono serii',
    languageNotFound: 'Nie znaleziono języka',
    showLess: 'Pokaż mniej',
    showAll: 'Pokaż wszystkie',
    clearFilters: 'Wyczyść filtry',
    channel: 'Kanał',
    guests: 'Goście',
    series: 'Seria',
  },
  en: {
    tagline: 'Aggregator and search engine for video materials and podcasts.',
    allChannels: 'All channels in database',
    noResults: 'No results for these filters.',
    projectSite: 'Project site',
    reportBug: 'Report a bug',
    reportContent: 'Suggest content',
    copyright: '© 2026 pablottolbap. All rights reserved. Made with ❤️ using React, Vite and GitHub Pages.',
    filterByTag: 'Filter by tag:',
    filterByChannel: 'Filter by channel:',
    filterByPerson: 'Filter by person:',
    filterBySeries: 'Filter by series:',
    filterByLanguage: 'Filter by language:',
    searchChannel: 'Search for a channel...',
    searchPerson: 'Enter name and surname...',
    searchSeries: 'Search for a series...',
    searchLanguage: 'Select a language...',
    channelNotFound: 'Channel not found',
    personNotFound: 'Person not found',
    seriesNotFound: 'Series not found',
    languageNotFound: 'Language not found',
    showLess: 'Show less',
    showAll: 'Show all',
    clearFilters: 'Clear all filters',
    channel: 'Channel',
    guests: 'Guests',
    series: 'Series',
  },
};

const STORAGE_KEY = 'vitalio-ui-lang';

const LanguageContext = createContext({ lang: 'pl', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'pl') return saved;
    } catch {
      // localStorage niedostępny — używamy domyślnego języka
    }
    return 'pl';
  });

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignorujemy błędy zapisu
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations.pl[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
