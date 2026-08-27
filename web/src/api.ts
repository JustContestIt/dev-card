/** Thin typed client over the card's own GraphQL API (same origin). */

export type Locale = 'RU' | 'EN';

/** Resume PDFs live in public/cv/ — one per locale. */
export function cvPath(locale: Locale): string {
  return `/cv/CV_Beryoza_${locale === 'RU' ? 'ru' : 'en'}.pdf`;
}

export interface Profile {
  fullName: string;
  title: string;
  summary: string;
  location: string;
  email: string;
  github: string;
  telegram: string;
  websiteUrl: string | null;
  openToWork: boolean;
}

export interface Skill {
  name: string;
  category: 'LANGUAGE' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'TOOLING';
  level: number;
  yearsUsed: number;
  featured: boolean;
  endorsements: number;
}

export interface Experience {
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string | null;
  stack: string[];
}

export interface Project {
  slug: string;
  name: string;
  description: string;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  highlight: boolean;
}

export interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  messagesReceived: number;
  totalEndorsements: number;
  uptimeSeconds: number;
  version: string;
}

export interface CardData {
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  stats: Stats;
}

interface GqlError {
  message: string;
  extensions?: { code?: string };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await res.json()) as { data?: T; errors?: GqlError[] };
  if (payload.errors?.length) {
    const first = payload.errors[0];
    throw new ApiError(first.message, first.extensions?.code);
  }
  if (!payload.data) {
    throw new ApiError(`Empty response (HTTP ${res.status})`);
  }
  return payload.data;
}

/** One round-trip for the whole card — that is the point of GraphQL. */
export const CARD_QUERY = `query Card($locale: Locale!) {
  profile(locale: $locale) {
    fullName title summary location email github telegram websiteUrl openToWork
  }
  skills {
    name category level yearsUsed featured endorsements
  }
  experience(locale: $locale) {
    company role description startDate endDate stack
  }
  projects(locale: $locale) {
    slug name description stack repoUrl liveUrl highlight
  }
  stats {
    totalViews uniqueVisitors messagesReceived totalEndorsements uptimeSeconds version
  }
}`;

export function fetchCard(locale: Locale): Promise<CardData> {
  return gql<CardData>(CARD_QUERY, { locale });
}

export const ENDORSE_MUTATION = `mutation Endorse($name: String!) {
  endorseSkill(name: $name) { name endorsements }
}`;

export function endorseSkill(name: string): Promise<{ endorseSkill: { name: string; endorsements: number } }> {
  return gql(ENDORSE_MUTATION, { name });
}

export const SEND_MESSAGE_MUTATION = `mutation Send($input: SendMessageInput!) {
  sendMessage(input: $input) { id createdAt confirmation }
}`;

export function sendMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ sendMessage: { id: string; confirmation: string } }> {
  return gql(SEND_MESSAGE_MUTATION, { input });
}

export const TRACK_VIEW_MUTATION = `mutation Track($path: String!) {
  trackView(path: $path)
}`;

export function trackView(path: string): Promise<{ trackView: number }> {
  return gql(TRACK_VIEW_MUTATION, { path });
}
