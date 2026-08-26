import { ApiError, CardData, Locale, Skill, endorseSkill, sendMessage } from './api';
import { CATEGORY_LABELS, STRINGS, Strings } from './i18n';
import { qrSvg } from './qr';

const CATEGORY_ORDER = ['LANGUAGE', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLING'] as const;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fmtDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'RU' ? 'ru-RU' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function levelBar(level: number): string {
  return '▰'.repeat(level) + '▱'.repeat(5 - level);
}

export function renderCard(root: HTMLElement, data: CardData, locale: Locale): void {
  const s = STRINGS[locale];
  root.replaceChildren();

  root.append(
    renderHero(data, s),
    renderAbout(data, s),
    renderSkills(data, s, locale),
    renderExperience(data, s, locale),
    renderProjects(data, s),
    renderContact(s),
    renderFooter(data, s),
  );
}

function renderHero(data: CardData, s: Strings): HTMLElement {
  const p = data.profile;
  const hero = el('header', 'hero');

  const flex = el('div', 'hero-flex');
  const left = el('div');

  const status = el('div', 'status-line');
  if (p.openToWork) {
    status.append(el('span', 'status-dot'), el('span', undefined, s.openToWork));
  }
  status.append(el('span', undefined, `· ${p.location}`));
  left.append(status);

  left.append(el('h1', 'name', p.fullName));
  left.append(el('div', 'title-line', `// ${p.title}`));

  const meta = el('div', 'hero-meta');
  const email = el('a', undefined, p.email);
  email.href = `mailto:${p.email}`;
  const gh = el('a', undefined, p.github.replace('https://', ''));
  gh.href = p.github;
  gh.target = '_blank';
  gh.rel = 'noopener';
  const tg = el('a', undefined, p.telegram.replace('https://', ''));
  tg.href = p.telegram;
  tg.target = '_blank';
  tg.rel = 'noopener';
  meta.append(email, gh, tg);
  left.append(meta);

  const qr = el('div', 'qr-box');
  qr.innerHTML = qrSvg(`${window.location.origin}/vcard.vcf`, 96);
  qr.append(el('div', 'qr-label', '→ vCard'));

  flex.append(left, qr);
  hero.append(flex);
  return hero;
}

function renderAbout(data: CardData, s: Strings): HTMLElement {
  const sec = el('section');
  sec.append(secTitle('01', s.sections.about));
  sec.append(el('p', 'about-text', data.profile.summary));
  return sec;
}

function renderSkills(data: CardData, s: Strings, locale: Locale): HTMLElement {
  const sec = el('section');
  sec.append(secTitle('02', s.sections.skills));

  for (const cat of CATEGORY_ORDER) {
    const items = data.skills.filter((sk) => sk.category === cat);
    if (!items.length) continue;

    const group = el('div', 'skill-group');
    group.append(el('div', 'skill-group-name', `# ${CATEGORY_LABELS[locale][cat] ?? cat}`));
    for (const sk of items) {
      group.append(skillRow(sk, s));
    }
    sec.append(group);
  }
  return sec;
}

function skillRow(sk: Skill, s: Strings): HTMLElement {
  const row = el('div', 'skill-row');
  row.append(el('span', 'skill-name', sk.name));
  row.append(el('span', 'skill-dots'));
  row.append(el('span', 'skill-level', levelBar(sk.level)));
  const years = Math.round(sk.yearsUsed);
  row.append(el('span', 'skill-years', s.years(years)));

  const btn = el('button', 'endorse', `▲ ${sk.endorsements}`);
  btn.title = s.endorseTitle;
  btn.addEventListener('click', () => {
    btn.disabled = true;
    endorseSkill(sk.name)
      .then((res) => {
        btn.textContent = `▲ ${res.endorseSkill.endorsements}`;
        btn.classList.add('done');
      })
      .catch(() => {
        btn.classList.add('done');
      })
      .finally(() => {
        btn.disabled = false;
      });
  });
  row.append(btn);
  return row;
}

function renderExperience(data: CardData, s: Strings, locale: Locale): HTMLElement {
  const sec = el('section');
  sec.append(secTitle('03', s.sections.experience));

  for (const xp of data.experience) {
    const item = el('div', 'xp');
    const head = el('div', 'xp-head');
    const roleWrap = el('div');
    roleWrap.append(el('span', 'xp-role', xp.role), el('span', 'xp-company', ` · ${xp.company}`));
    const dates = el('span', 'xp-dates');
    dates.textContent = `${fmtDate(xp.startDate, locale)} — ${
      xp.endDate ? fmtDate(xp.endDate, locale) : s.present
    }`;
    head.append(roleWrap, dates);
    item.append(head);
    item.append(el('p', 'xp-desc', xp.description));
    item.append(chips(xp.stack));
    sec.append(item);
  }
  return sec;
}

function renderProjects(data: CardData, s: Strings): HTMLElement {
  const sec = el('section');
  sec.append(secTitle('04', s.sections.projects));

  for (const pr of data.projects) {
    const card = el('div', `project${pr.highlight ? ' hl' : ''}`);
    const head = el('div', 'project-head');
    head.append(el('span', 'project-name', pr.name));

    const links = el('span', 'project-links');
    if (pr.repoUrl) {
      const a = el('a', undefined, 'git');
      a.href = pr.repoUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      links.append(a);
    }
    if (pr.liveUrl) {
      const a = el('a', undefined, 'live');
      a.href = pr.liveUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      links.append(a);
    }
    head.append(links);
    card.append(head);
    card.append(el('p', 'project-desc', pr.description));
    card.append(chips(pr.stack));
    sec.append(card);
  }
  return sec;
}

function renderContact(s: Strings): HTMLElement {
  const sec = el('section');
  sec.append(secTitle('05', s.sections.contact));

  const form = el('form', 'contact-form');
  form.noValidate = true;

  const nameField = field(s.form.name, s.form.nameHint, 'input');
  const emailField = field(s.form.email, s.form.emailHint, 'input');
  (emailField.control as HTMLInputElement).type = 'email';
  const msgField = field(s.form.message, s.form.messageHint, 'textarea');

  const submit = el('button', 'submit', s.form.submit);
  submit.type = 'submit';
  const note = el('div', 'form-note');

  form.append(nameField.wrap, emailField.wrap, msgField.wrap, submit, note);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.textContent = '';
    note.className = 'form-note';
    submit.disabled = true;
    submit.textContent = s.form.sending;

    sendMessage({
      name: (nameField.control as HTMLInputElement).value.trim(),
      email: (emailField.control as HTMLInputElement).value.trim(),
      message: (msgField.control as HTMLTextAreaElement).value.trim(),
    })
      .then((res) => {
        note.textContent = `✓ ${res.sendMessage.confirmation}`;
        note.classList.add('ok');
        form.reset();
      })
      .catch((err: unknown) => {
        note.classList.add('err');
        if (err instanceof ApiError && err.code === 'RATE_LIMITED') {
          note.textContent = `✗ ${s.errors.rateLimited}`;
        } else if (err instanceof ApiError) {
          note.textContent = `✗ ${err.message}`;
        } else {
          note.textContent = `✗ ${s.errors.generic}`;
        }
      })
      .finally(() => {
        submit.disabled = false;
        submit.textContent = s.form.submit;
      });
  });

  sec.append(form);
  return sec;
}

function renderFooter(data: CardData, s: Strings): HTMLElement {
  const f = el('footer');
  const stats = el('div', 'stats');
  const up = formatUptime(data.stats.uptimeSeconds);
  stats.append(
    el('span', undefined, `${data.stats.totalViews} ${s.footer.views}`),
    el('span', undefined, `${s.footer.uptime} ${up}`),
    el('span', undefined, `v${data.stats.version}`),
  );

  const built = el('div');
  built.append(document.createTextNode(`${s.footer.builtWith} `));
  const stack = el('span', undefined, 'NestJS · GraphQL · Prisma · CockroachDB');
  built.append(stack);
  const schema = el('a', undefined, ' · schema.gql');
  schema.href = 'https://github.com/JustContestIt/dev-card/blob/main/schema.gql';
  schema.target = '_blank';
  schema.rel = 'noopener';
  built.append(schema);

  f.append(stats, built);
  return f;
}

function formatUptime(sec: number): string {
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
  return `${Math.floor(sec / 86400)}d ${Math.floor((sec % 86400) / 3600)}h`;
}

function secTitle(idx: string, text: string): HTMLElement {
  const h = el('h2', 'sec');
  h.append(el('span', 'idx', idx), document.createTextNode(text));
  return h;
}

function chips(names: string[]): HTMLElement {
  const box = el('div', 'chips');
  for (const n of names) {
    box.append(el('span', 'chip', n.toLowerCase()));
  }
  return box;
}

function field(
  label: string,
  hint: string,
  kind: 'input' | 'textarea',
): { wrap: HTMLElement; control: HTMLInputElement | HTMLTextAreaElement } {
  const wrap = el('div', 'field');
  const lab = el('label');
  lab.append(el('span', undefined, label), el('span', undefined, hint));
  const control = kind === 'input' ? el('input') : el('textarea');
  wrap.append(lab, control);
  return { wrap, control };
}

export function renderLoadError(root: HTMLElement, locale: Locale): void {
  const s = STRINGS[locale];
  root.replaceChildren();
  const boot = el('div', 'boot');
  boot.append(el('span', 'err', `✗ ${s.errors.load}`));
  root.append(boot);
}
