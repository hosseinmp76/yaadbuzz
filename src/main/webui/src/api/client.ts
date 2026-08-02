import { openapi, unwrap } from './openapiClient'
import type {
  Characteristic,
  Comment,
  Connection,
  Invite,
  Media,
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

export const api = {
  me: () => unwrap(openapi.GET('/api/me')) as Promise<User>,
  updateMyProfile: (displayName: string) =>
    unwrap(openapi.PATCH('/api/me', { body: { displayName } })) as Promise<User>,

  myOrganizations: () =>
    unwrap(openapi.GET('/api/organizations')) as Promise<Organization[]>,
  createOrganization: (name: string, brandColor: string) =>
    unwrap(openapi.POST('/api/organizations', { body: { name, brandColor } })) as Promise<Organization>,
  organization: (id: string) =>
    unwrap(openapi.GET('/api/organizations/{id}', { params: { path: { id } } })) as Promise<Organization>,
  updateOrganizationBranding: (id: string, brandColor: string, logoId?: string | null) =>
    unwrap(
      openapi.PATCH('/api/organizations/{id}/branding', {
        params: { path: { id } },
        body: { brandColor, logoId: logoId ?? undefined },
      }),
    ) as Promise<Organization>,

  teams: (organizationId: string) =>
    unwrap(
      openapi.GET('/api/organizations/{orgId}/teams', {
        params: { path: { orgId: organizationId } },
      }),
    ) as Promise<Team[]>,
  createTeam: (organizationId: string, name: string, brandColor: string) =>
    unwrap(
      openapi.POST('/api/organizations/{orgId}/teams', {
        params: { path: { orgId: organizationId } },
        body: { name, brandColor },
      }),
    ) as Promise<Team>,
  team: (id: string) =>
    unwrap(openapi.GET('/api/teams/{id}', { params: { path: { id } } })) as Promise<Team>,
  updateTeamSettings: (
    teamId: string,
    body: {
      brandColor?: string | null
      coverMediaId?: string | null
      revealTributes?: boolean | null
      revealAt?: string | null
    },
  ) =>
    unwrap(
      openapi.PATCH('/api/teams/{id}', {
        params: { path: { id: teamId } },
        body: {
          brandColor: body.brandColor ?? undefined,
          coverMediaId: body.coverMediaId ?? undefined,
          revealTributes: body.revealTributes ?? undefined,
          revealAt: body.revealAt ?? undefined,
        },
      }),
    ) as Promise<Team>,
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
    unwrap(
      openapi.PATCH('/api/teams/{id}/yearbook-settings', {
        params: { path: { id: teamId } },
        body: {
          title: body.title ?? undefined,
          subtitle: body.subtitle ?? undefined,
          dedication: body.dedication ?? undefined,
          theme: body.theme as 'CLASSIC' | 'MODERN' | 'SCRAPBOOK' | 'MINIMAL' | undefined,
          showMembers: body.showMembers ?? undefined,
          showTributes: body.showTributes ?? undefined,
          showCharacteristics: body.showCharacteristics ?? undefined,
          showMemories: body.showMemories ?? undefined,
          showAwards: body.showAwards ?? undefined,
        },
      }),
    ) as Promise<Team>,

  teamMembers: (teamId: string, opts?: { first?: number; after?: string; query?: string }) =>
    unwrap(
      openapi.GET('/api/teams/{id}/members', {
        params: {
          path: { id: teamId },
          query: { first: opts?.first, after: opts?.after, query: opts?.query },
        },
      }),
    ).then((page) => ({
      items: page?.items ?? [],
      nextCursor: page?.nextCursor,
      hasNext: !!page?.hasNext,
    })) as Promise<Connection<TeamMember>>,
  myTeamMembership: (teamId: string) =>
    unwrap(
      openapi.GET('/api/teams/{id}/members/me', { params: { path: { id: teamId } } }),
    ) as Promise<TeamMember>,
  teamMember: (id: string) =>
    unwrap(openapi.GET('/api/members/{id}', { params: { path: { id } } })) as Promise<TeamMember>,
  upsertTeamMemberProfile: (
    teamId: string,
    body: { nickname?: string | null; bio?: string | null; avatarId?: string | null },
  ) =>
    unwrap(
      openapi.PATCH('/api/teams/{id}/profile', {
        params: { path: { id: teamId } },
        body: {
          nickname: body.nickname ?? undefined,
          bio: body.bio ?? undefined,
          avatarId: body.avatarId ?? undefined,
        },
      }),
    ) as Promise<TeamMember>,

  createInvite: (
    teamId: string,
    body: { role?: string | null; maxUses?: number | null; expiresAt?: string | null },
  ) =>
    unwrap(
      openapi.POST('/api/teams/{id}/invites', {
        params: { path: { id: teamId } },
        body: {
          role: (body.role ?? undefined) as 'ADMIN' | 'MEMBER' | undefined,
          maxUses: body.maxUses ?? undefined,
          expiresAt: body.expiresAt ?? undefined,
        },
      }),
    ) as Promise<Invite>,
  inviteByEmail: (teamId: string, email: string, role?: string | null) =>
    unwrap(
      openapi.POST('/api/teams/{id}/invites/email', {
        params: { path: { id: teamId } },
        body: {
          email,
          role: (role ?? undefined) as 'ADMIN' | 'MEMBER' | undefined,
        },
      }),
    ) as Promise<Invite>,
  joinTeam: (code: string, nickname: string, bio?: string | null) =>
    unwrap(
      openapi.POST('/api/teams/join', {
        body: { code, nickname, bio: bio ?? undefined },
      }),
    ) as Promise<TeamMember>,

  tributes: (teamId: string, opts?: { recipientId?: string; first?: number; after?: string }) =>
    unwrap(
      openapi.GET('/api/teams/{id}/tributes', {
        params: {
          path: { id: teamId },
          query: {
            recipientId: opts?.recipientId,
            first: opts?.first,
            after: opts?.after,
          },
        },
      }),
    ).then((page) => ({
      items: page?.items ?? [],
      nextCursor: page?.nextCursor,
      hasNext: !!page?.hasNext,
    })) as Promise<Connection<Tribute>>,
  createTribute: (
    teamId: string,
    body: {
      recipientId: string
      text: string
      anonymous: boolean
      privateTribute: boolean
    },
  ) =>
    unwrap(
      openapi.POST('/api/teams/{id}/tributes', {
        params: { path: { id: teamId } },
        body,
      }),
    ) as Promise<Tribute>,
  publishTribute: (tributeId: string) =>
    unwrap(
      openapi.POST('/api/tributes/{id}/publish', { params: { path: { id: tributeId } } }),
    ) as Promise<Tribute>,
  unpublishTribute: (tributeId: string) =>
    unwrap(
      openapi.POST('/api/tributes/{id}/unpublish', { params: { path: { id: tributeId } } }),
    ) as Promise<Tribute>,
  memories: (teamId: string, opts?: { first?: number; after?: string }) =>
    unwrap(
      openapi.GET('/api/teams/{id}/memories', {
        params: {
          path: { id: teamId },
          query: { first: opts?.first, after: opts?.after },
        },
      }),
    ).then((page) => ({
      items: page?.items ?? [],
      nextCursor: page?.nextCursor,
      hasNext: !!page?.hasNext,
    })) as Promise<Connection<Memory>>,
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
    unwrap(
      openapi.POST('/api/teams/{id}/memories', {
        params: { path: { id: teamId } },
        body: {
          title: body.title,
          bodyText: body.bodyText,
          privateMemory: body.privateMemory,
          taggedIds: body.taggedIds ?? undefined,
          mediaIds: body.mediaIds ?? undefined,
        },
      }),
    ) as Promise<Memory>,
  comments: (memoryId: string) =>
    unwrap(
      openapi.GET('/api/memories/{id}/comments', { params: { path: { id: memoryId } } }),
    ) as Promise<Comment[]>,
  addComment: (
    memoryId: string,
    body: { text: string; parentId?: string | null; mediaIds?: string[] | null },
  ) =>
    unwrap(
      openapi.POST('/api/memories/{id}/comments', {
        params: { path: { id: memoryId } },
        body: {
          text: body.text,
          parentId: body.parentId ?? undefined,
          mediaIds: body.mediaIds ?? undefined,
        },
      }),
    ) as Promise<Comment>,

  topics: (teamId: string) =>
    unwrap(
      openapi.GET('/api/teams/{id}/topics', { params: { path: { id: teamId } } }),
    ) as Promise<Topic[]>,
  createTopic: (teamId: string, title: string) =>
    unwrap(
      openapi.POST('/api/teams/{id}/topics', {
        params: { path: { id: teamId } },
        body: { title },
      }),
    ) as Promise<Topic>,
  topicStandings: (topicId: string) =>
    unwrap(
      openapi.GET('/api/topics/{id}/standings', { params: { path: { id: topicId } } }),
    ) as Promise<TopicStanding[]>,
  voteTopic: (topicId: string, nomineeId: string, repetitions?: number | null) =>
    unwrap(
      openapi.POST('/api/topics/{id}/votes', {
        params: { path: { id: topicId } },
        body: { nomineeId, repetitions: repetitions ?? undefined },
      }),
    ) as Promise<{ ok?: boolean }>,

  characteristics: (teamMemberId: string) =>
    unwrap(
      openapi.GET('/api/members/{id}/characteristics', {
        params: { path: { id: teamMemberId } },
      }),
    ) as Promise<Characteristic[]>,
  addCharacteristic: (teamMemberId: string, title: string) =>
    unwrap(
      openapi.POST('/api/members/{id}/characteristics', {
        params: { path: { id: teamMemberId } },
        body: { title },
      }),
    ) as Promise<Characteristic>,

  search: (teamId: string, q: string, opts?: { first?: number; after?: string }) =>
    unwrap(
      openapi.GET('/api/teams/{id}/search', {
        params: {
          path: { id: teamId },
          query: { q, first: opts?.first, after: opts?.after },
        },
      }),
    ).then((page) => ({
      items: page?.items ?? [],
      nextCursor: page?.nextCursor,
      hasNext: !!page?.hasNext,
    })) as Promise<Connection<SearchHit>>,

  yearbook: (teamId: string) =>
    unwrap(
      openapi.GET('/api/teams/{id}/yearbook', { params: { path: { id: teamId } } }),
    ) as Promise<Yearbook>,
  yearbookExports: (teamId: string) =>
    unwrap(
      openapi.GET('/api/teams/{id}/yearbook-exports', { params: { path: { id: teamId } } }),
    ) as Promise<YearbookExport[]>,
  requestYearbookExport: (teamId: string) =>
    unwrap(
      openapi.POST('/api/teams/{id}/yearbook-exports', { params: { path: { id: teamId } } }),
    ) as Promise<YearbookExport>,

  uploadMedia: (file: File) =>
    unwrap(
      openapi.POST('/api/media', {
        // Schema types multipart file as string; serialize to FormData at runtime.
        body: { file: '' },
        bodySerializer() {
          const fd = new FormData()
          fd.append('file', file)
          return fd
        },
      }),
    ) as Promise<Media>,
}
