import type { Locale } from './api';

export interface Strings {
  nav: { vcard: string; api: string; source: string; tty: string };
  sections: { about: string; skills: string; experience: string; projects: string; contact: string };
  openToWork: string;
  present: string;
  years: (n: number) => string;
  endorseTitle: string;
  form: {
    name: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    nameHint: string;
    emailHint: string;
    messageHint: string;
  };
  footer: { views: string; uptime: string; builtWith: string };
  errors: { load: string; rateLimited: string; generic: string };
  ttyHint: string;
}

export const STRINGS: Record<Locale, Strings> = {
  RU: {
    nav: { vcard: 'vCard', api: 'API', source: 'Код', tty: 'Терминал' },
    sections: {
      about: 'О себе',
      skills: 'Стек',
      experience: 'Опыт',
      projects: 'Проекты',
      contact: 'Написать мне',
    },
    openToWork: 'открыт к предложениям',
    present: 'сейчас',
    years: (n) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} год`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} года`;
      return `${n} лет`;
    },
    endorseTitle: 'Считаете навык релевантным? Плюсаните',
    form: {
      name: 'Имя',
      email: 'Email',
      message: 'Сообщение',
      submit: 'Отправить',
      sending: 'Отправка…',
      nameHint: '2–80 символов',
      emailHint: 'корректный адрес',
      messageHint: '10–2000 символов',
    },
    footer: { views: 'просмотров', uptime: 'аптайм', builtWith: 'Собрано на' },
    errors: {
      load: 'Не удалось загрузить данные. API недоступен?',
      rateLimited: 'Слишком часто. Попробуйте позже.',
      generic: 'Что-то пошло не так.',
    },
    ttyHint: 'наберите help',
  },
  EN: {
    nav: { vcard: 'vCard', api: 'API', source: 'Source', tty: 'Terminal' },
    sections: {
      about: 'About',
      skills: 'Stack',
      experience: 'Experience',
      projects: 'Projects',
      contact: 'Get in touch',
    },
    openToWork: 'open to work',
    present: 'present',
    years: (n) => (n === 1 ? '1 yr' : `${n} yrs`),
    endorseTitle: 'Find this skill relevant? Upvote it',
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      submit: 'Send',
      sending: 'Sending…',
      nameHint: '2–80 chars',
      emailHint: 'valid address',
      messageHint: '10–2000 chars',
    },
    footer: { views: 'views', uptime: 'uptime', builtWith: 'Built with' },
    errors: {
      load: 'Failed to load data. Is the API down?',
      rateLimited: 'Too many requests. Try again later.',
      generic: 'Something went wrong.',
    },
    ttyHint: 'type help',
  },
};

export const CATEGORY_LABELS: Record<Locale, Record<string, string>> = {
  RU: {
    LANGUAGE: 'языки',
    BACKEND: 'backend',
    DATABASE: 'базы данных',
    DEVOPS: 'devops',
    TOOLING: 'инструменты',
  },
  EN: {
    LANGUAGE: 'languages',
    BACKEND: 'backend',
    DATABASE: 'databases',
    DEVOPS: 'devops',
    TOOLING: 'tooling',
  },
};
