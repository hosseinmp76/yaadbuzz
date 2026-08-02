import { apiFetch } from './http'
import type {
  Characteristic,
  Comment,
  Connection,
  Invite,
  Memory,
  Organization,
  SearchHit,
  Team,
  TeamMember,
  Topic,
  TopicStanding,
  Tribute,
  User,
  Yearbook,
  YearbookExport,
} from './types'

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const api = {
  me: () => apiFetch<User>('/api/me'),
  updateMyProfile: (displayName: string) =>
    apiFetch<User>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName }),
    }),

  myOrganizations: () => apiFetch<Organization[]>('/api/organizations'),
  createOrganization: (name: string, brandColor: string) =>
    apiFetch<Organization>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, brandColor }),
    }),
  organization: (id: string) => apiFetch<Organization>(`/api/organizations/${id}`),
  updateOrganizationBranding: (id: string, brandColor: string, logoId?: string | null) =>
    apiFetch<Organization>(`/api/organizations/${id}/branding`, {
      method: 'PATCH',
      body: JSON.stringify({ brandColor, logoId }),
    }),

  teams: (organizationId: string) =>
    apiFetch<Team[]>(`/api/organizations/${organizationId}/teams`),
  createTeam: (organizationId: string, name: string, brandColor: string) =>
    apiFetch<Team>(`/api/organizations/${organizationId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name, brandColor }),
    }),
  team: (id: string) => apiFetch<Team>(`/api/teams/${id}`),
  updateTeamSettings: (
    teamId: string,
    body: {
      brandColor?: string | null
      coverMediaId?: string | null
      revealTributes?: boolean | null
      revealAt?: string | null
    },
  ) =>
    apiFetch<Team>(`/api/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  updateYearbookSettings: (
    teamId: string,
    body: {
      title?: string | null
      subtitle?: string | null
      dedication?: string | null
      theme?: string | null
      showMembers?: boolean | null
      showTributes?: boolean | null
      showCharacteristics?: boolean | null
      showMemories?: boolean | null
      showAwards?: boolean | null
    },
  ) =>
    apiFetch<Team>(`/api/teams/${teamId}/yearbook-settings`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  teamMembers: (teamId: string, opts?: { first?: number; after?: string; query?: string }) =>
    apiFetch<Connection<TeamMember>>(
      `/api/teams/${teamId}/members${qs({
        first: opts?.first,
        after: opts?.after,
        query: opts?.query,
      })}`,
    ),
  myTeamMembership: (teamId: string) =>
    apiFetch<TeamMember>(`/api/teams/${teamId}/members/me`),
  teamMember: (id: string) => apiFetch<TeamMember>(`/api/members/${id}`),
  upsertTeamMemberProfile: (
    teamId: string,
    body: { nickname?: string | null; bio?: string | null; avatarId?: string | null },
  ) =>
    apiFetch<TeamMember>(`/api/teams/${teamId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  createInvite: (
    teamId: string,
    body: { role?: string | null; maxUses?: number | null; expiresAt?: string | null },
  ) =>
    apiFetch<Invite>(`/api/teams/${teamId}/invites`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  inviteByEmail: (teamId: string, email: string, role?: string | null) =>
    apiFetch<Invite>(`/api/teams/${teamId}/invites/email`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
  joinTeam: (code: string, nickname: string, bio?: string | null) =>
    apiFetch<TeamMember>('/api/teams/join', {
      method: 'POST',
      body: JSON.stringify({ code, nickname, bio }),
    }),

  tributes: (
    teamId: string,
    opts?: { recipientId?: string; first?: number; after?: string },
  ) =>
    apiFetch<Connection<Tribute>>(
      `/api/teams/${teamId}/tributes${qs({
        recipientId: opts?.recipientId,
        first: opts?.first,
        after: opts?.after,
      })}`,
    ),
  createTribute: (
    teamId: string,
    body: {
      recipientId: string
      text: string
      anonymous: boolean
      privateTribute: boolean
    },
  ) =>
    apiFetch<Tribute>(`/api/teams/${teamId}/tributes`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  reportTribute: (tributeId: string, reason: string) =>
    apiFetch<{ ok: boolean }>(`/api/tributes/${tributeId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  hideTribute: (tributeId: string) =>
    apiFetch<Tribute>(`/api/tributes/${tributeId}/hide`, { method: 'POST' }),

  memories: (teamId: string, opts?: { first?: number; after?: string }) =>
    apiFetch<Connection<Memory>>(
      `/api/teams/${teamId}/memories${qs({ first: opts?.first, after: opts?.after })}`,
    ),
  createMemory: (
    teamId: string,
    body: {
      title: string
      bodyText: string
      privateMemory: boolean
      taggedIds?: string[] | null
      mediaIds?: string[] | null
    },
  ) =>
    apiFetch<Memory>(`/api/teams/${teamId}/memories`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  comments: (memoryId: string) =>
    apiFetch<Comment[]>(`/api/memories/${memoryId}/comments`),
  addComment: (
    memoryId: string,
    body: { text: string; parentId?: string | null; mediaIds?: string[] | null },
  ) =>
    apiFetch<Comment>(`/api/memories/${memoryId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  topics: (teamId: string) => apiFetch<Topic[]>(`/api/teams/${teamId}/topics`),
  createTopic: (teamId: string, title: string) =>
    apiFetch<Topic>(`/api/teams/${teamId}/topics`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  topicStandings: (topicId: string) =>
    apiFetch<TopicStanding[]>(`/api/topics/${topicId}/standings`),
  voteTopic: (topicId: string, nomineeId: string, repetitions?: number | null) =>
    apiFetch<{ ok: boolean }>(`/api/topics/${topicId}/votes`, {
      method: 'POST',
      body: JSON.stringify({ nomineeId, repetitions }),
    }),

  characteristics: (teamMemberId: string) =>
    apiFetch<Characteristic[]>(`/api/members/${teamMemberId}/characteristics`),
  addCharacteristic: (teamMemberId: string, title: string) =>
    apiFetch<Characteristic>(`/api/members/${teamMemberId}/characteristics`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  search: (teamId: string, q: string, opts?: { first?: number; after?: string }) =>
    apiFetch<Connection<SearchHit>>(
      `/api/teams/${teamId}/search${qs({ q, first: opts?.first, after: opts?.after })}`,
    ),

  yearbook: (teamId: string) => apiFetch<Yearbook>(`/api/teams/${teamId}/yearbook`),
  yearbookExports: (teamId: string) =>
    apiFetch<YearbookExport[]>(`/api/teams/${teamId}/yearbook-exports`),
  requestYearbookExport: (teamId: string) =>
    apiFetch<YearbookExport>(`/api/teams/${teamId}/yearbook-exports`, { method: 'POST' }),
}
