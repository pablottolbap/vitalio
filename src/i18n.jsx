import { createContext, useContext, useState, useEffect } from 'react';

/* eslint-disable react-refresh/only-export-components */

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
    formTitle: 'Zaproponuj nowy materiał',
    formIntro: 'Wypełnij formularz, a propozycja (w formacie JSON) trafi e-mailem do autora projektu.',
    formPrivacy: 'Przesyłając formularz, akceptujesz wysłanie Twojej propozycji do Web3Forms w celu dostarczenia e-maila. Czasowe znaczniki wysyłek są przechowywane lokalnie w celu zapobiegania spamowi.',
    formDailyLimit: 'Osiągnąłeś limit 5 propozycji dziennie. Spróbuj ponownie jutro.',
    fldType: 'Typ',
    fldLanguage: 'Język',
    fldTitle: 'Tytuł',
    fldUrl: 'Adres URL (YouTube)',
    fldChannelName: 'Nazwa kanału',
    fldChannelUrl: 'Adres kanału',
    fldTopics: 'Tagi',
    fldTopicsHint: 'oddziel przecinkami, bez #',
    fldGuests: 'Goście',
    fldGuestsHint: 'oddziel przecinkami',
    fldSeriesName: 'Nazwa serii',
    fldSeriesOrder: 'Nr odcinka',
    fldEmail: 'Twój e-mail',
    optional: 'opcjonalne',
    formSubmit: 'Wyślij propozycję',
    formSending: 'Wysyłanie...',
    formSuccess: 'Dziękujemy! Propozycja została wysłana.',
    formError: 'Coś poszło nie tak. Spróbuj ponownie lub skorzystaj z GitHub.',
    formOrDiscussion: 'Wolisz GitHub? Otwórz dyskusję',
    formSubmitCount: 'Wykorzystany limit: {used} / 5',
    close: 'Zamknij',
    totalLinks: 'Filmy łącznie:',
    sortBy: 'Sortuj:',
    sort_author: 'Autor',
    sort_title: 'Tytuł',
    sort_series: 'Seria',
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
    formTitle: 'Suggest a new material',
    formIntro: 'Fill in the form and your proposal (as JSON) will be emailed to the project author.',
    formPrivacy: 'By submitting this form, you agree to send your proposal to Web3Forms to deliver an email. Submission timestamps are stored locally to prevent spam.',
    formDailyLimit: 'You have reached the limit of 5 proposals per day. Try again tomorrow.',
    fldType: 'Type',
    fldLanguage: 'Language',
    fldTitle: 'Title',
    fldUrl: 'URL (YouTube)',
    fldChannelName: 'Channel name',
    fldChannelUrl: 'Channel URL',
    fldTopics: 'Tags',
    fldTopicsHint: 'comma-separated, no #',
    fldGuests: 'Guests',
    fldGuestsHint: 'comma-separated',
    fldSeriesName: 'Series name',
    fldSeriesOrder: 'Episode no.',
    fldEmail: 'Your email',
    optional: 'optional',
    formSubmit: 'Send proposal',
    formSending: 'Sending...',
    formSuccess: 'Thank you! Your proposal has been sent.',
    formError: 'Something went wrong. Please try again or use GitHub.',
    formOrDiscussion: 'Prefer GitHub? Open a discussion',
    formSubmitCount: 'Submitted: {used} / 5',
    close: 'Close',
    totalLinks: 'Total videos:',
    sortBy: 'Sort by:',
    sort_author: 'Author',
    sort_title: 'Title',
    sort_series: 'Series',
  },
};

const STORAGE_KEY = 'vitalio-ui-lang';

const LanguageContext = createContext({ lang: 'pl', setLang: () => { }, t: (k) => k });

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
