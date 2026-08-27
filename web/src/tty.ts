import { CARD_QUERY, CardData, Locale, cvPath, gql } from './api';
import { STRINGS } from './i18n';

const BANNER = String.raw`
  ███╗   ██╗██████╗
  ████╗  ██║██╔══██╗   nikita beryoza
  ██╔██╗ ██║██████╔╝   typescript backend developer
  ██║╚██╗██║██╔══██╗   nestjs · graphql · prisma
  ██║ ╚████║██████╔╝   cockroachdb · docker · claude code
  ╚═╝  ╚═══╝╚═════╝
`;

interface TtyDeps {
  getData: () => CardData | null;
  getLocale: () => Locale;
  setLocale: (l: Locale) => void;
  toggleTheme: () => void;
  close: () => void;
}

export class Tty {
  private readonly out: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly overlay: HTMLElement;
  private readonly history: string[] = [];
  private histIdx = -1;
  private booted = false;

  constructor(private readonly deps: TtyDeps) {
    this.overlay = document.getElementById('tty') as HTMLElement;
    this.out = document.getElementById('tty-out') as HTMLElement;
    this.input = document.getElementById('tty-in') as HTMLInputElement;

    this.input.addEventListener('keydown', (e) => this.onKey(e));
    this.overlay.addEventListener('click', () => this.input.focus());
  }

  open(): void {
    this.overlay.classList.add('open');
    if (!this.booted) {
      this.booted = true;
      this.print(BANNER, 'acc');
      this.print(`  ${STRINGS[this.deps.getLocale()].ttyHint}\n`, 'dim');
    }
    this.input.focus();
  }

  close(): void {
    this.overlay.classList.remove('open');
  }

  isOpen(): boolean {
    return this.overlay.classList.contains('open');
  }

  private onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const line = this.input.value;
      this.input.value = '';
      this.histIdx = -1;
      if (line.trim()) {
        this.history.unshift(line);
      }
      this.print(`guest@card:~$ ${line}`);
      void this.exec(line.trim());
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.histIdx < this.history.length - 1) {
        this.histIdx++;
        this.input.value = this.history[this.histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIdx > 0) {
        this.histIdx--;
        this.input.value = this.history[this.histIdx];
      } else {
        this.histIdx = -1;
        this.input.value = '';
      }
    } else if (e.key === 'Escape') {
      this.deps.close();
    }
  }

  private print(text: string, cls?: string): void {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text + '\n';
    this.out.append(span);
    this.out.scrollTop = this.out.scrollHeight;
  }

  private printQuery(q: string): void {
    this.print(`# ${q.replace(/\s+/g, ' ').slice(0, 120)}…`, 'dim');
  }

  private async exec(line: string): Promise<void> {
    if (!line) return;
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    const data = this.deps.getData();
    const loc = this.deps.getLocale();

    switch (cmd.toLowerCase()) {
      case 'help':
        this.print(
          [
            '  about      — кто я / who I am',
            '  skills     — стек с уровнями',
            '  exp        — опыт работы',
            '  projects   — проекты',
            '  stats      — живые счётчики карточки',
            '  gql <q>    — выполнить произвольный GraphQL-запрос',
            '  lang ru|en — язык контента',
            '  theme      — светлая/тёмная тема',
            '  vcard      — скачать контакт (.vcf)',
            '  cv         — открыть резюме (PDF, язык текущей локали)',
            '  source     — исходный код на GitHub',
            '  gui        — вернуться в обычный режим (Esc)',
            '  clear      — очистить экран',
          ].join('\n'),
        );
        break;

      case 'about': {
        if (!data) return this.print('данные ещё грузятся…', 'dim');
        this.printQuery('query { profile(locale: ' + loc + ') { fullName title summary } }');
        const p = data.profile;
        this.print(`${p.fullName} — ${p.title}`, 'acc');
        this.print(p.summary);
        this.print(`${p.email} · ${p.github}`);
        break;
      }

      case 'skills': {
        if (!data) return this.print('данные ещё грузятся…', 'dim');
        this.printQuery('query { skills { name level yearsUsed endorsements } }');
        for (const sk of data.skills) {
          const bar = '▰'.repeat(sk.level) + '▱'.repeat(5 - sk.level);
          this.print(
            `  ${sk.name.padEnd(16)} ${bar}  ${String(sk.yearsUsed).padStart(2)}y  ▲${sk.endorsements}`,
          );
        }
        break;
      }

      case 'exp': {
        if (!data) return this.print('данные ещё грузятся…', 'dim');
        this.printQuery('query { experience(locale: ' + loc + ') { company role startDate endDate } }');
        for (const xp of data.experience) {
          const from = xp.startDate.slice(0, 7);
          const to = xp.endDate ? xp.endDate.slice(0, 7) : 'now';
          this.print(`  ${from} → ${to}  ${xp.role} · ${xp.company}`, 'acc');
          this.print(`    ${xp.description}`);
        }
        break;
      }

      case 'projects': {
        if (!data) return this.print('данные ещё грузятся…', 'dim');
        this.printQuery('query { projects(locale: ' + loc + ') { name description stack } }');
        for (const pr of data.projects) {
          this.print(`  ${pr.name}${pr.highlight ? ' ★' : ''}`, 'acc');
          this.print(`    ${pr.description}`);
          this.print(`    [${pr.stack.join(', ')}]`, 'dim');
        }
        break;
      }

      case 'stats': {
        this.printQuery('query { stats { totalViews uniqueVisitors uptimeSeconds version } }');
        try {
          const res = await gql<CardData>(CARD_QUERY, { locale: loc });
          const st = res.stats;
          this.print(
            `  views: ${st.totalViews} · visitors: ${st.uniqueVisitors} · messages: ${st.messagesReceived}\n` +
              `  endorsements: ${st.totalEndorsements} · uptime: ${st.uptimeSeconds}s · v${st.version}`,
          );
        } catch {
          this.print('API недоступен', 'err');
        }
        break;
      }

      case 'gql': {
        if (!arg) {
          this.print('пример: gql query { skills { name endorsements } }', 'dim');
          break;
        }
        try {
          const res = await fetch('/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query: arg }),
          });
          const json: unknown = await res.json();
          this.print(JSON.stringify(json, null, 2));
        } catch (e) {
          this.print(String(e), 'err');
        }
        break;
      }

      case 'lang': {
        const target = arg.toUpperCase();
        if (target === 'RU' || target === 'EN') {
          this.deps.setLocale(target as Locale);
          this.print(`ok, locale → ${target}`);
        } else {
          this.print('usage: lang ru|en', 'dim');
        }
        break;
      }

      case 'theme':
        this.deps.toggleTheme();
        this.print('ok');
        break;

      case 'vcard':
        window.location.href = '/vcard.vcf';
        this.print('↓ vcard.vcf');
        break;

      case 'cv':
        window.open(cvPath(loc), '_blank', 'noopener');
        this.print(`→ ${cvPath(loc)}`);
        break;

      case 'source':
        window.open('https://github.com/JustContestIt/dev-card', '_blank', 'noopener');
        this.print('→ github.com/JustContestIt/dev-card');
        break;

      case 'gui':
      case 'exit':
        this.deps.close();
        break;

      case 'clear':
        this.out.replaceChildren();
        break;

      case 'sudo':
        this.print('nice try.', 'err');
        break;

      default:
        this.print(`command not found: ${cmd} (try: help)`, 'err');
    }
  }
}
