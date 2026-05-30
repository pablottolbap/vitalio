<p align="center">
  <img src="src/assets/logo.png" alt="Vitalio" width="400">
</p>

<p align="center">
  Agregator i wyszukiwarka materiałów wideo oraz podcastów o zdrowiu, diecie i stylu życia.
</p>

<p align="center">
  <img alt="Stack" src="https://img.shields.io/badge/React-Vite-6f42c1">
  <img alt="Hosting" src="https://img.shields.io/badge/Hosting-GitHub%20Pages-28a745">
  <img alt="Język" src="https://img.shields.io/badge/Język-PL%20%2F%20EN-007BFF">
</p>

<p align="center">
  <strong>Polski</strong> · <a href="README.en.md">English</a>
</p>

---

- [✨ O projekcie](#-o-projekcie)
- [🚀 Funkcje](#-funkcje)
- [🗂️ Struktura projektu](#️-struktura-projektu)
- [📥 Instrukcja dodawania nowych materiałów (Contributing Guide)](#-instrukcja-dodawania-nowych-materiałów-contributing-guide)
  - [🧩 Schemat pojedynczego wpisu](#-schemat-pojedynczego-wpisu)
  - [📋 Opis pól](#-opis-pól)
  - [✉️ Sposób 1 (domyślny): formularz na stronie](#️-sposób-1-domyślny-formularz-na-stronie)
  - [🛠️ Sposób 2: GitHub (pull request lub dyskusja)](#️-sposób-2-github-pull-request-lub-dyskusja)

---

## ✨ O projekcie

Vitalio to lekka baza materiałów wideo i podcastów, którą można filtrować po **kanale**, **osobie**, **tagach**, **serii** oraz **języku**. Projekt działa w architekturze statycznej (JAMstack) — nie ma żadnego backendu ani bazy danych po stronie serwera.

Cała zawartość przechowywana jest jako pliki JSON w katalogu [`content/`](content/). Podczas budowania skrypt [`scripts/aggregate.js`](scripts/aggregate.js) zbiera wszystkie wpisy do jednego pliku [`src/data.json`](src/data.json), który zasila aplikację React.

> 📁 **Organizacja treści:** każdy plik w `content/` odpowiada jednemu kanałowi YouTube, a jego nazwa to nazwa kanału zapisana w formacie `snake_case` (np. `tlusta_agata.json`). Pojedynczy plik zawiera **tablicę** wszystkich materiałów z danego kanału.

---

## 🚀 Funkcje

- 🌍 **Dwujęzyczny interfejs (PL / EN)** — przełącznik flagą w prawym górnym rogu; wybór zapamiętywany w `localStorage`. Tłumaczone są elementy interfejsu — tytuły materiałów pozostają w oryginalnym języku.
- 🏳️ **Filtrowanie po języku materiału** — z flagami (🇵🇱 / 🇬🇧) renderowanymi jako SVG, więc wyglądają identycznie na każdej platformie. Flaga na karcie jest klikalna i od razu filtruje listę.
- 🌙 **Tryb ciemny / jasny** — przełącznik motywu; domyślnie zgodny z ustawieniem systemu (`prefers-color-scheme`), wybór zapamiętywany w `localStorage`.
- 🔎 **Filtry** — po tagach, kanale, osobie (gościu), serii i języku; filtry odzwierciedlane są w adresie URL.
- ♾️ **Infinite scroll** — materiały doładowują się podczas przewijania.
- ✉️ **Formularz zgłoszeń (Web3Forms)** — propozycję nowego materiału można wysłać bez konta GitHub; trafia ona e-mailem do autora w gotowym formacie JSON. Chroniony przez Cloudflare Turnstile CAPTCHA i rate limiting (max 5 propozycji dziennie, 30s przerwy między wysłaniami).

---

## 🗂️ Struktura projektu

| Ścieżka | Opis |
| --- | --- |
| [`content/`](content/) | Źródłowe pliki JSON — jeden plik = jeden kanał (tablica materiałów). |
| [`scripts/aggregate.js`](scripts/aggregate.js) | Skleja wszystkie pliki z `content/` w `src/data.json`. |
| [`src/data.json`](src/data.json) | Wygenerowana baza materiałów (zasila aplikację, jest commitowana). |
| [`src/App.jsx`](src/App.jsx) | Główny komponent — stan filtrów, infinite scroll, układ. |
| [`src/components/FilterPanel.jsx`](src/components/FilterPanel.jsx) | Panel filtrów (tagi + listy rozwijane). |
| [`src/components/VideoCard.jsx`](src/components/VideoCard.jsx) | Karta pojedynczego materiału. |
| [`src/components/Flag.jsx`](src/components/Flag.jsx) | Flagi jako SVG (PL / GB). |
| [`src/components/ContributionForm.jsx`](src/components/ContributionForm.jsx) | Formularz zgłoszeń (Web3Forms). |
| [`src/i18n.jsx`](src/i18n.jsx) | System tłumaczeń interfejsu (PL/EN). |
| [`src/theme.jsx`](src/theme.jsx) | System motywów (jasny/ciemny) + style dla react-select. |
| [`src/languages.js`](src/languages.js) | Pomocniki dla pola `language` (flaga, nazwa języka). |

---

## 📥 Instrukcja dodawania nowych materiałów (Contributing Guide)

Materiał zawsze ma tę samą strukturę (opisaną niżej). Możesz go zgłosić na dwa sposoby — **najprościej przez formularz na stronie** (Sposób 1), a jeśli wolisz GitHub — przez pull request lub dyskusję (Sposób 2).

### 🧩 Schemat pojedynczego wpisu

Każdy nowy materiał (wideo lub podcast) ma strukturę obiektu opisaną w pliku [`content/_example.txt`](content/_example.txt):

```json
{
  "id": "nazwa-kanalu-1",
  "type": "video",
  "title": "Tytuł materiału",
  "url": "https://www.youtube.com/watch?v=...",
  "language": "PL",
  "author": {
    "name": "Nazwa Kanału",
    "channelUrl": "https://www.youtube.com/@..."
  },
  "guests": ["Imię Nazwisko", "Gość 2"],
  "topics": ["temat1", "temat2"],
  "series": {
    "name": "Nazwa Serii",
    "order": 1
  }
}
```

### 📋 Opis pól

| Pole | Wymagane | Opis |
| --- | :---: | --- |
| `id` | ✅ | Unikalny identyfikator w formacie `nazwa-kanalu-numer` (np. `tlusta-agata-1`). |
| `type` | ✅ | Typ materiału — `"video"`, `"podcast"` lub `"qa"`. |
| `title` | ✅ | Pełny tytuł wyświetlany na karcie. |
| `url` | ✅ | Pełny link do materiału w serwisie YouTube. |
| `language` | ✅ | Język materiału — `"PL"` lub `"EN"` (steruje flagą i filtrem języka). |
| `author.name` | ✅ | Nazwa kanału. |
| `author.channelUrl` | ✅ | Link do kanału autora. |
| `guests` | ⬜ | Lista gości (tablica stringów; może być pusta `[]`). |
| `topics` | ✅ | Tagi/tematy — małymi literami, bez znaku `#`. |
| `series` | ⬜ | Obiekt `{ "name", "order" }` lub `null`, jeśli materiał nie należy do żadnej serii. |

### ✉️ Sposób 1 (domyślny): formularz na stronie

Najprostsza metoda — **nie wymaga konta GitHub**:

1. Na dole strony kliknij **💡 Zaproponuj treść**.
2. Wypełnij formularz (typ, tytuł, link, język, kanał, tagi — pola `goście` i `seria` są opcjonalne).
3. Wyślij. Propozycja trafia e-mailem do autora projektu jako gotowy do wklejenia wpis JSON.

Formularz korzysta z usługi [Web3Forms](https://web3forms.com) i jest obsługiwany przez komponent [`src/components/ContributionForm.jsx`](src/components/ContributionForm.jsx).

### 🛠️ Sposób 2: GitHub (pull request lub dyskusja)

Jeśli wolisz GitHub:

1. Dodaj wpis do pliku JSON o nazwie **odpowiadającej kanałowi** (`snake_case`), z którego pochodzi materiał. Jeśli plik dla danego kanału jeszcze nie istnieje — utwórz go jako tablicę z jednym obiektem.
2. Utwórz osobny branch i wykonaj **pull request** do gałęzi `develop`.
3. Przynajmniej raz w tygodniu zmiany będą publikowane w głównej gałęzi projektu.

Nie chcesz robić PR-a? Otwórz [nowe zapotrzebowanie](https://github.com/pablottolbap/vitalio/discussions/new?category=new-materials-request) i podaj jak najwięcej informacji wymaganych przez szablon.

Wszelkie błędy zgłaszaj w [zgłoszeniach](https://github.com/pablottolbap/vitalio/issues) projektu, natomiast pomysły na rozwój strony możesz zgłosić w [pomysłach](https://github.com/pablottolbap/vitalio/discussions/categories/ideas).

---

<p align="center">
  <sub>Dokumentacja stworzona i utrzymywana przez Autora projektu. Ostatnia aktualizacja: maj 2026.</sub>
</p>
