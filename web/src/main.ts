import { CardData, Locale, fetchCard, trackView } from './api';
import { renderCard, renderLoadError } from './gui';
import { Tty } from './tty';

type Theme = 'light' | 'dark';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — fine */
  }
}

let locale: Locale = safeGet('locale') === 'EN' ? 'EN' : 'RU';
let theme: Theme =
  (safeGet('theme') as Theme | null) ??
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let data: CardData | null = null;

const content = document.getElementById('content') as HTMLElement;
const btnLang = document.getElementById('btn-lang') as HTMLButtonElement;
const btnTheme = document.getElementById('btn-theme') as HTMLButtonElement;
const btnTty = document.getElementById('btn-tty') as HTMLButtonElement;
const clock = document.getElementById('clock') as HTMLElement;

function applyTheme(): void {
  document.documentElement.dataset.theme = theme;
  safeSet('theme', theme);
}

function toggleTheme(): void {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme();
}

function setLocale(l: Locale): void {
  locale = l;
  safeSet('locale', l);
  btnLang.textContent = l === 'RU' ? 'EN' : 'RU';
  document.documentElement.lang = l.toLowerCase();
  void load();
}

let loadSeq = 0;

async function load(): Promise<void> {
  // Guard against fast locale toggling: only the latest request may render,
  // otherwise a slow earlier response would overwrite the newer content.
  const seq = ++loadSeq;
  const requested = locale;
  try {
    const fetched = await fetchCard(requested);
    if (seq !== loadSeq) return;
    data = fetched;
    renderCard(content, data, requested);
  } catch {
    if (seq !== loadSeq) return;
    renderLoadError(content, requested);
  }
}

const tty = new Tty({
  getData: () => data,
  getLocale: () => locale,
  setLocale,
  toggleTheme,
  close: () => tty.close(),
});

btnLang.addEventListener('click', () => setLocale(locale === 'RU' ? 'EN' : 'RU'));
btnTheme.addEventListener('click', toggleTheme);
btnTty.addEventListener('click', () => tty.open());
document.addEventListener('keydown', (e) => {
  if (e.key === '`' && !tty.isOpen() && document.activeElement?.tagName !== 'INPUT'
      && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault();
    tty.open();
  }
});

function tick(): void {
  clock.textContent = new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

applyTheme();
btnLang.textContent = locale === 'RU' ? 'EN' : 'RU';
tick();
setInterval(tick, 1000);
void load();
// Fire-and-forget analytics — a failed beacon must never break the card.
trackView('/').catch(() => undefined);
