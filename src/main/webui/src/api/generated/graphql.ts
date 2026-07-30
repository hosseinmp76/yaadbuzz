import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Scalar for BigDecimal */
  BigDecimal: { input: any; output: any; }
  /** Scalar for BigInteger */
  BigInteger: { input: any; output: any; }
  /** Scalar for DateTime */
  DateTime: { input: string; output: string; }
};

export type CharacteristicType = {
  count: Scalars['Int']['output'];
  id: Maybe<Scalars['String']['output']>;
  teamMemberId: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type CommentType = {
  /** ISO-8601 */
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['String']['output']>;
  memoryId: Maybe<Scalars['String']['output']>;
  text: Maybe<Scalars['String']['output']>;
  writer: Maybe<TeamMemberType>;
};

export type ConnectionMemory = {
  hasNext: Scalars['Boolean']['output'];
  items: Maybe<Array<Maybe<MemoryType>>>;
  nextCursor: Maybe<Scalars['String']['output']>;
};

export type ConnectionSearch = {
  hasNext: Scalars['Boolean']['output'];
  items: Maybe<Array<Maybe<SearchHitType>>>;
  nextCursor: Maybe<Scalars['String']['output']>;
};

export type ConnectionTeamMember = {
  hasNext: Scalars['Boolean']['output'];
  items: Maybe<Array<Maybe<TeamMemberType>>>;
  nextCursor: Maybe<Scalars['String']['output']>;
};

export type ConnectionTribute = {
  hasNext: Scalars['Boolean']['output'];
  items: Maybe<Array<Maybe<TributeType>>>;
  nextCursor: Maybe<Scalars['String']['output']>;
};

export type ExportStatus =
  | 'FAILED'
  | 'PENDING'
  | 'PROCESSING'
  | 'READY';

export type InviteType = {
  code: Maybe<Scalars['String']['output']>;
  email: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  expiresAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['String']['output']>;
  maxUses: Maybe<Scalars['Int']['output']>;
  role: Maybe<TeamRole>;
  teamId: Maybe<Scalars['String']['output']>;
  useCount: Scalars['Int']['output'];
};

export type MediaType = {
  id: Maybe<Scalars['String']['output']>;
  mimeType: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export type MemoryType = {
  bodyText: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['String']['output']>;
  pictures: Maybe<Array<Maybe<MediaType>>>;
  privateMemory: Scalars['Boolean']['output'];
  tagged: Maybe<Array<Maybe<TeamMemberType>>>;
  teamId: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  writer: Maybe<TeamMemberType>;
};

/** Mutation root */
export type Mutation = {
  addCharacteristic: Maybe<CharacteristicType>;
  addComment: Maybe<CommentType>;
  createInvite: Maybe<InviteType>;
  createMemory: Maybe<MemoryType>;
  createOrganization: Maybe<OrganizationType>;
  createTeam: Maybe<TeamType>;
  createTopic: Maybe<TopicType>;
  createTribute: Maybe<TributeType>;
  hideTribute: Maybe<TributeType>;
  inviteByEmail: Maybe<InviteType>;
  joinTeam: Maybe<TeamMemberType>;
  reportTribute: Maybe<Scalars['Boolean']['output']>;
  requestYearbookExport: Maybe<YearbookExportType>;
  /** Update the current user's display name */
  updateMyProfile: Maybe<UserType>;
  updateOrganizationBranding: Maybe<OrganizationType>;
  updateTeamSettings: Maybe<TeamType>;
  /** Customize online/print yearbook layout and sections */
  updateYearbookSettings: Maybe<TeamType>;
  upsertTeamMemberProfile: Maybe<TeamMemberType>;
  voteTopic: Maybe<Scalars['Boolean']['output']>;
};


/** Mutation root */
export type MutationAddCharacteristicArgs = {
  teamMemberId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationAddCommentArgs = {
  mediaIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  memoryId?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateInviteArgs = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  maxUses?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<TeamRole>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateMemoryArgs = {
  bodyText?: InputMaybe<Scalars['String']['input']>;
  mediaIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  privateMemory: Scalars['Boolean']['input'];
  taggedIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  teamId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateOrganizationArgs = {
  brandColor?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateTeamArgs = {
  brandColor?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateTopicArgs = {
  teamId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateTributeArgs = {
  anonymous: Scalars['Boolean']['input'];
  privateTribute: Scalars['Boolean']['input'];
  recipientId?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationHideTributeArgs = {
  tributeId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationInviteByEmailArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<TeamRole>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationJoinTeamArgs = {
  bio?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationReportTributeArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  tributeId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationRequestYearbookExportArgs = {
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationUpdateMyProfileArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationUpdateOrganizationBrandingArgs = {
  brandColor?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  logoId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationUpdateTeamSettingsArgs = {
  brandColor?: InputMaybe<Scalars['String']['input']>;
  coverMediaId?: InputMaybe<Scalars['String']['input']>;
  revealAt?: InputMaybe<Scalars['DateTime']['input']>;
  revealTributes?: InputMaybe<Scalars['Boolean']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationUpdateYearbookSettingsArgs = {
  dedication?: InputMaybe<Scalars['String']['input']>;
  showAwards?: InputMaybe<Scalars['Boolean']['input']>;
  showCharacteristics?: InputMaybe<Scalars['Boolean']['input']>;
  showMembers?: InputMaybe<Scalars['Boolean']['input']>;
  showMemories?: InputMaybe<Scalars['Boolean']['input']>;
  showTributes?: InputMaybe<Scalars['Boolean']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<YearbookTheme>;
  title?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationUpsertTeamMemberProfileArgs = {
  avatarId?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationVoteTopicArgs = {
  nomineeId?: InputMaybe<Scalars['String']['input']>;
  repetitions?: InputMaybe<Scalars['Int']['input']>;
  topicId?: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationType = {
  brandColor: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  logo: Maybe<MediaType>;
  name: Maybe<Scalars['String']['output']>;
};

/** Query root */
export type Query = {
  characteristics: Maybe<Array<Maybe<CharacteristicType>>>;
  comments: Maybe<Array<Maybe<CommentType>>>;
  /** Current authenticated user */
  me: Maybe<UserType>;
  memories: Maybe<ConnectionMemory>;
  myOrganizations: Maybe<Array<Maybe<OrganizationType>>>;
  /** Current user's membership in a team */
  myTeamMembership: Maybe<TeamMemberType>;
  organization: Maybe<OrganizationType>;
  search: Maybe<ConnectionSearch>;
  team: Maybe<TeamType>;
  teamMember: Maybe<TeamMemberType>;
  teamMembers: Maybe<ConnectionTeamMember>;
  teams: Maybe<Array<Maybe<TeamType>>>;
  topicStandings: Maybe<Array<Maybe<TopicStandingType>>>;
  topics: Maybe<Array<Maybe<TopicType>>>;
  tributes: Maybe<ConnectionTribute>;
  /** Assembled yearbook for online viewing and browser print-to-PDF */
  yearbook: Maybe<YearbookType>;
  yearbookExports: Maybe<Array<Maybe<YearbookExportType>>>;
};


/** Query root */
export type QueryCharacteristicsArgs = {
  teamMemberId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryCommentsArgs = {
  memoryId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryMemoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryMyTeamMembershipArgs = {
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryOrganizationArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTeamArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTeamMemberArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTeamMembersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTeamsArgs = {
  organizationId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTopicStandingsArgs = {
  topicId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTopicsArgs = {
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTributesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  recipientId?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryYearbookArgs = {
  teamId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryYearbookExportsArgs = {
  teamId?: InputMaybe<Scalars['String']['input']>;
};

export type SearchHitType = {
  id: Maybe<Scalars['String']['output']>;
  snippet: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type TeamMemberType = {
  avatar: Maybe<MediaType>;
  bio: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  nickname: Maybe<Scalars['String']['output']>;
  role: Maybe<TeamRole>;
  teamId: Maybe<Scalars['String']['output']>;
  userId: Maybe<Scalars['String']['output']>;
};

export type TeamRole =
  | 'ADMIN'
  | 'MEMBER';

export type TeamType = {
  brandColor: Maybe<Scalars['String']['output']>;
  coverMedia: Maybe<MediaType>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organizationId: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  revealAt: Maybe<Scalars['DateTime']['output']>;
  revealTributes: Scalars['Boolean']['output'];
  tributesRevealed: Scalars['Boolean']['output'];
  yearbookDedication: Maybe<Scalars['String']['output']>;
  yearbookShowAwards: Scalars['Boolean']['output'];
  yearbookShowCharacteristics: Scalars['Boolean']['output'];
  yearbookShowMembers: Scalars['Boolean']['output'];
  yearbookShowMemories: Scalars['Boolean']['output'];
  yearbookShowTributes: Scalars['Boolean']['output'];
  yearbookSubtitle: Maybe<Scalars['String']['output']>;
  yearbookTheme: Maybe<YearbookTheme>;
  yearbookTitle: Maybe<Scalars['String']['output']>;
};

export type TopicStandingType = {
  nominee: Maybe<TeamMemberType>;
  score: Scalars['Int']['output'];
};

export type TopicType = {
  id: Maybe<Scalars['String']['output']>;
  teamId: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type TributeType = {
  anonymous: Scalars['Boolean']['output'];
  /** ISO-8601 */
  createdAt: Maybe<Scalars['DateTime']['output']>;
  hidden: Scalars['Boolean']['output'];
  id: Maybe<Scalars['String']['output']>;
  privateTribute: Scalars['Boolean']['output'];
  recipient: Maybe<TeamMemberType>;
  teamId: Maybe<Scalars['String']['output']>;
  text: Maybe<Scalars['String']['output']>;
  writer: Maybe<TeamMemberType>;
};

export type UserType = {
  displayName: Maybe<Scalars['String']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
};

export type YearbookCharacteristicType = {
  count: Scalars['Int']['output'];
  title: Maybe<Scalars['String']['output']>;
};

export type YearbookExportType = {
  /** ISO-8601 */
  completedAt: Maybe<Scalars['DateTime']['output']>;
  /** ISO-8601 */
  createdAt: Maybe<Scalars['DateTime']['output']>;
  errorMessage: Maybe<Scalars['String']['output']>;
  fileUrl: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  status: Maybe<ExportStatus>;
  teamId: Maybe<Scalars['String']['output']>;
};

export type YearbookMemberType = {
  avatarUrl: Maybe<Scalars['String']['output']>;
  bio: Maybe<Scalars['String']['output']>;
  characteristics: Maybe<Array<Maybe<YearbookCharacteristicType>>>;
  nickname: Maybe<Scalars['String']['output']>;
  tributes: Maybe<Array<Maybe<YearbookTributeType>>>;
};

export type YearbookMemoryType = {
  body: Maybe<Scalars['String']['output']>;
  imageUrls: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Maybe<Scalars['String']['output']>;
  writer: Maybe<Scalars['String']['output']>;
};

export type YearbookStandingType = {
  nickname: Maybe<Scalars['String']['output']>;
  score: Scalars['Int']['output'];
};

export type YearbookTheme =
  | 'CLASSIC'
  | 'MINIMAL'
  | 'MODERN'
  | 'SCRAPBOOK';

export type YearbookTopicType = {
  standings: Maybe<Array<Maybe<YearbookStandingType>>>;
  title: Maybe<Scalars['String']['output']>;
};

export type YearbookTributeType = {
  text: Maybe<Scalars['String']['output']>;
  writer: Maybe<Scalars['String']['output']>;
};

export type YearbookType = {
  brandColor: Maybe<Scalars['String']['output']>;
  coverMediaUrl: Maybe<Scalars['String']['output']>;
  dedication: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  members: Maybe<Array<Maybe<YearbookMemberType>>>;
  memories: Maybe<Array<Maybe<YearbookMemoryType>>>;
  orgName: Maybe<Scalars['String']['output']>;
  showAwards: Scalars['Boolean']['output'];
  showCharacteristics: Scalars['Boolean']['output'];
  showMembers: Scalars['Boolean']['output'];
  showMemories: Scalars['Boolean']['output'];
  showTributes: Scalars['Boolean']['output'];
  subtitle: Maybe<Scalars['String']['output']>;
  teamId: Maybe<Scalars['String']['output']>;
  teamName: Maybe<Scalars['String']['output']>;
  theme: Maybe<YearbookTheme>;
  title: Maybe<Scalars['String']['output']>;
  topics: Maybe<Array<Maybe<YearbookTopicType>>>;
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string, displayName: string } };

export type UpdateMyProfileMutationVariables = Exact<{
  displayName: Scalars['String']['input'];
}>;


export type UpdateMyProfileMutation = { updateMyProfile: { id: string, email: string, displayName: string } };

export type MyTeamMembershipQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type MyTeamMembershipQuery = { myTeamMembership: { id: string, nickname: string, bio: string, avatar: { id: string, url: string } } };

export type MyOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOrganizationsQuery = { myOrganizations: Array<{ id: string, name: string, brandColor: string }> };

export type TeamsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type TeamsQuery = { teams: Array<{ id: string, name: string, brandColor: string, revealTributes: boolean, tributesRevealed: boolean }> };

export type TeamQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TeamQuery = { team: { id: string, organizationId: string, name: string, brandColor: string, revealTributes: boolean, revealAt: string, tributesRevealed: boolean, yearbookTitle: string, yearbookSubtitle: string, yearbookDedication: string, yearbookTheme: YearbookTheme, yearbookShowMembers: boolean, yearbookShowTributes: boolean, yearbookShowCharacteristics: boolean, yearbookShowMemories: boolean, yearbookShowAwards: boolean } };

export type TeamMembersQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
}>;


export type TeamMembersQuery = { teamMembers: { nextCursor: string, hasNext: boolean, items: Array<{ id: string, nickname: string, bio: string, role: TeamRole, avatar: { url: string } }> } };

export type TeamMemberQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TeamMemberQuery = { teamMember: { id: string, teamId: string, nickname: string, bio: string, role: TeamRole, avatar: { url: string } } };

export type TributesQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  recipientId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type TributesQuery = { tributes: { nextCursor: string, hasNext: boolean, items: Array<{ id: string, text: string, anonymous: boolean, privateTribute: boolean, createdAt: string, writer: { id: string, nickname: string }, recipient: { id: string, nickname: string } }> } };

export type MemoriesQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MemoriesQuery = { memories: { nextCursor: string, hasNext: boolean, items: Array<{ id: string, title: string, bodyText: string, privateMemory: boolean, createdAt: string, writer: { id: string, nickname: string }, tagged: Array<{ id: string, nickname: string }>, pictures: Array<{ id: string, url: string, mimeType: string }> }> } };

export type TopicsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type TopicsQuery = { topics: Array<{ id: string, title: string }> };

export type TopicStandingsQueryVariables = Exact<{
  topicId: Scalars['String']['input'];
}>;


export type TopicStandingsQuery = { topicStandings: Array<{ score: number, nominee: { id: string, nickname: string } }> };

export type CharacteristicsQueryVariables = Exact<{
  teamMemberId: Scalars['String']['input'];
}>;


export type CharacteristicsQuery = { characteristics: Array<{ id: string, title: string, count: number }> };

export type SearchQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
  q: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchQuery = { search: { nextCursor: string, hasNext: boolean, items: Array<{ type: string, id: string, title: string, snippet: string }> } };

export type YearbookExportsQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type YearbookExportsQuery = { yearbookExports: Array<{ id: string, status: ExportStatus, fileUrl: string, errorMessage: string, createdAt: string, completedAt: string }> };

export type YearbookQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type YearbookQuery = { yearbook: { teamId: string, orgName: string, teamName: string, title: string, subtitle: string, dedication: string, theme: YearbookTheme, brandColor: string, logoUrl: string, coverMediaUrl: string, showMembers: boolean, showTributes: boolean, showCharacteristics: boolean, showMemories: boolean, showAwards: boolean, members: Array<{ nickname: string, bio: string, avatarUrl: string, characteristics: Array<{ title: string, count: number }>, tributes: Array<{ text: string, writer: string }> }>, memories: Array<{ title: string, body: string, writer: string, imageUrls: Array<string> }>, topics: Array<{ title: string, standings: Array<{ nickname: string, score: number }> }> } };

export type UpdateYearbookSettingsMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  dedication?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<YearbookTheme>;
  showMembers?: InputMaybe<Scalars['Boolean']['input']>;
  showTributes?: InputMaybe<Scalars['Boolean']['input']>;
  showCharacteristics?: InputMaybe<Scalars['Boolean']['input']>;
  showMemories?: InputMaybe<Scalars['Boolean']['input']>;
  showAwards?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateYearbookSettingsMutation = { updateYearbookSettings: { id: string, yearbookTitle: string, yearbookSubtitle: string, yearbookDedication: string, yearbookTheme: YearbookTheme, yearbookShowMembers: boolean, yearbookShowTributes: boolean, yearbookShowCharacteristics: boolean, yearbookShowMemories: boolean, yearbookShowAwards: boolean } };

export type CreateOrganizationMutationVariables = Exact<{
  name: Scalars['String']['input'];
  brandColor?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateOrganizationMutation = { createOrganization: { id: string, name: string } };

export type CreateTeamMutationVariables = Exact<{
  organizationId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  brandColor?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTeamMutation = { createTeam: { id: string, name: string } };

export type CreateInviteMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  role?: InputMaybe<TeamRole>;
  maxUses?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateInviteMutation = { createInvite: { id: string, code: string, role: TeamRole, maxUses: number, email: string } };

export type InviteByEmailMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  role?: InputMaybe<TeamRole>;
}>;


export type InviteByEmailMutation = { inviteByEmail: { id: string, code: string, role: TeamRole, email: string, maxUses: number } };

export type JoinTeamMutationVariables = Exact<{
  code: Scalars['String']['input'];
  nickname?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
}>;


export type JoinTeamMutation = { joinTeam: { id: string, teamId: string, nickname: string } };

export type UpsertProfileMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  nickname?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  avatarId?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpsertProfileMutation = { upsertTeamMemberProfile: { id: string, nickname: string, bio: string, avatar: { url: string } } };

export type CreateTributeMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  recipientId: Scalars['String']['input'];
  text: Scalars['String']['input'];
  anonymous: Scalars['Boolean']['input'];
  privateTribute: Scalars['Boolean']['input'];
}>;


export type CreateTributeMutation = { createTribute: { id: string, text: string } };

export type CreateMemoryMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  bodyText: Scalars['String']['input'];
  privateMemory: Scalars['Boolean']['input'];
  taggedIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  mediaIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type CreateMemoryMutation = { createMemory: { id: string, title: string, pictures: Array<{ id: string, url: string }> } };

export type CreateTopicMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  title: Scalars['String']['input'];
}>;


export type CreateTopicMutation = { createTopic: { id: string, title: string } };

export type VoteTopicMutationVariables = Exact<{
  topicId: Scalars['String']['input'];
  nomineeId: Scalars['String']['input'];
  repetitions?: InputMaybe<Scalars['Int']['input']>;
}>;


export type VoteTopicMutation = { voteTopic: boolean };

export type AddCharacteristicMutationVariables = Exact<{
  teamMemberId: Scalars['String']['input'];
  title: Scalars['String']['input'];
}>;


export type AddCharacteristicMutation = { addCharacteristic: { id: string, title: string, count: number } };

export type UpdateTeamSettingsMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
  brandColor?: InputMaybe<Scalars['String']['input']>;
  revealTributes?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateTeamSettingsMutation = { updateTeamSettings: { id: string, revealTributes: boolean, brandColor: string } };

export type RequestYearbookExportMutationVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type RequestYearbookExportMutation = { requestYearbookExport: { id: string, status: ExportStatus } };

export type HideTributeMutationVariables = Exact<{
  tributeId: Scalars['String']['input'];
}>;


export type HideTributeMutation = { hideTribute: { id: string, hidden: boolean } };

export type ReportTributeMutationVariables = Exact<{
  tributeId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
}>;


export type ReportTributeMutation = { reportTribute: boolean };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UpdateMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"displayName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"displayName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"displayName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}}]}}]} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const MyTeamMembershipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTeamMembership"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myTeamMembership"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<MyTeamMembershipQuery, MyTeamMembershipQueryVariables>;
export const MyOrganizationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brandColor"}}]}}]}}]} as unknown as DocumentNode<MyOrganizationsQuery, MyOrganizationsQueryVariables>;
export const TeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Teams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brandColor"}},{"kind":"Field","name":{"kind":"Name","value":"revealTributes"}},{"kind":"Field","name":{"kind":"Name","value":"tributesRevealed"}}]}}]}}]} as unknown as DocumentNode<TeamsQuery, TeamsQueryVariables>;
export const TeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Team"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brandColor"}},{"kind":"Field","name":{"kind":"Name","value":"revealTributes"}},{"kind":"Field","name":{"kind":"Name","value":"revealAt"}},{"kind":"Field","name":{"kind":"Name","value":"tributesRevealed"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookTitle"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookSubtitle"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookDedication"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookTheme"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowMembers"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowTributes"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowCharacteristics"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowMemories"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowAwards"}}]}}]}}]} as unknown as DocumentNode<TeamQuery, TeamQueryVariables>;
export const TeamMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamMembers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamMembers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]} as unknown as DocumentNode<TeamMembersQuery, TeamMembersQueryVariables>;
export const TeamMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<TeamMemberQuery, TeamMemberQueryVariables>;
export const TributesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Tributes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipientId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tributes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"anonymous"}},{"kind":"Field","name":{"kind":"Name","value":"privateTribute"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"writer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]} as unknown as DocumentNode<TributesQuery, TributesQueryVariables>;
export const MemoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Memories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"bodyText"}},{"kind":"Field","name":{"kind":"Name","value":"privateMemory"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"writer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tagged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pictures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]} as unknown as DocumentNode<MemoriesQuery, MemoriesQueryVariables>;
export const TopicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Topics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<TopicsQuery, TopicsQueryVariables>;
export const TopicStandingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TopicStandings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"topicId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topicStandings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"topicId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"topicId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"nominee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}}]}}]}}]} as unknown as DocumentNode<TopicStandingsQuery, TopicStandingsQueryVariables>;
export const CharacteristicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Characteristics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamMemberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characteristics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamMemberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamMemberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<CharacteristicsQuery, CharacteristicsQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"snippet"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const YearbookExportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"YearbookExports"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"yearbookExports"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fileUrl"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<YearbookExportsQuery, YearbookExportsQueryVariables>;
export const YearbookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Yearbook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"yearbook"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"orgName"}},{"kind":"Field","name":{"kind":"Name","value":"teamName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"dedication"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"brandColor"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"coverMediaUrl"}},{"kind":"Field","name":{"kind":"Name","value":"showMembers"}},{"kind":"Field","name":{"kind":"Name","value":"showTributes"}},{"kind":"Field","name":{"kind":"Name","value":"showCharacteristics"}},{"kind":"Field","name":{"kind":"Name","value":"showMemories"}},{"kind":"Field","name":{"kind":"Name","value":"showAwards"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"characteristics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"writer"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"memories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"writer"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"standings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}}]}}]}}]}}]} as unknown as DocumentNode<YearbookQuery, YearbookQueryVariables>;
export const UpdateYearbookSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateYearbookSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subtitle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dedication"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"theme"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"YearbookTheme"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"showMembers"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"showTributes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"showCharacteristics"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"showMemories"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"showAwards"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateYearbookSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"Argument","name":{"kind":"Name","value":"subtitle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subtitle"}}},{"kind":"Argument","name":{"kind":"Name","value":"dedication"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dedication"}}},{"kind":"Argument","name":{"kind":"Name","value":"theme"},"value":{"kind":"Variable","name":{"kind":"Name","value":"theme"}}},{"kind":"Argument","name":{"kind":"Name","value":"showMembers"},"value":{"kind":"Variable","name":{"kind":"Name","value":"showMembers"}}},{"kind":"Argument","name":{"kind":"Name","value":"showTributes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"showTributes"}}},{"kind":"Argument","name":{"kind":"Name","value":"showCharacteristics"},"value":{"kind":"Variable","name":{"kind":"Name","value":"showCharacteristics"}}},{"kind":"Argument","name":{"kind":"Name","value":"showMemories"},"value":{"kind":"Variable","name":{"kind":"Name","value":"showMemories"}}},{"kind":"Argument","name":{"kind":"Name","value":"showAwards"},"value":{"kind":"Variable","name":{"kind":"Name","value":"showAwards"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookTitle"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookSubtitle"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookDedication"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookTheme"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowMembers"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowTributes"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowCharacteristics"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowMemories"}},{"kind":"Field","name":{"kind":"Name","value":"yearbookShowAwards"}}]}}]}}]} as unknown as DocumentNode<UpdateYearbookSettingsMutation, UpdateYearbookSettingsMutationVariables>;
export const CreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"brandColor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"brandColor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"brandColor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const CreateTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"brandColor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"brandColor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"brandColor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateTeamMutation, CreateTeamMutationVariables>;
export const CreateInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxUses"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxUses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxUses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"maxUses"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<CreateInviteMutation, CreateInviteMutationVariables>;
export const InviteByEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteByEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamRole"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteByEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"maxUses"}}]}}]}}]} as unknown as DocumentNode<InviteByEmailMutation, InviteByEmailMutationVariables>;
export const JoinTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nickname"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bio"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}},{"kind":"Argument","name":{"kind":"Name","value":"nickname"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nickname"}}},{"kind":"Argument","name":{"kind":"Name","value":"bio"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bio"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teamId"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}}]}}]} as unknown as DocumentNode<JoinTeamMutation, JoinTeamMutationVariables>;
export const UpsertProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nickname"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bio"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"avatarId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTeamMemberProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"nickname"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nickname"}}},{"kind":"Argument","name":{"kind":"Name","value":"bio"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bio"}}},{"kind":"Argument","name":{"kind":"Name","value":"avatarId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"avatarId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<UpsertProfileMutation, UpsertProfileMutationVariables>;
export const CreateTributeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTribute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"anonymous"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"privateTribute"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTribute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}},{"kind":"Argument","name":{"kind":"Name","value":"anonymous"},"value":{"kind":"Variable","name":{"kind":"Name","value":"anonymous"}}},{"kind":"Argument","name":{"kind":"Name","value":"privateTribute"},"value":{"kind":"Variable","name":{"kind":"Name","value":"privateTribute"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]} as unknown as DocumentNode<CreateTributeMutation, CreateTributeMutationVariables>;
export const CreateMemoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMemory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bodyText"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"privateMemory"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taggedIds"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mediaIds"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMemory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"Argument","name":{"kind":"Name","value":"bodyText"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bodyText"}}},{"kind":"Argument","name":{"kind":"Name","value":"privateMemory"},"value":{"kind":"Variable","name":{"kind":"Name","value":"privateMemory"}}},{"kind":"Argument","name":{"kind":"Name","value":"taggedIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taggedIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"mediaIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mediaIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"pictures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CreateMemoryMutation, CreateMemoryMutationVariables>;
export const CreateTopicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTopic"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTopic"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<CreateTopicMutation, CreateTopicMutationVariables>;
export const VoteTopicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VoteTopic"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"topicId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nomineeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repetitions"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"voteTopic"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"topicId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"topicId"}}},{"kind":"Argument","name":{"kind":"Name","value":"nomineeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nomineeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"repetitions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repetitions"}}}]}]}}]} as unknown as DocumentNode<VoteTopicMutation, VoteTopicMutationVariables>;
export const AddCharacteristicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCharacteristic"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamMemberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCharacteristic"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamMemberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamMemberId"}}},{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<AddCharacteristicMutation, AddCharacteristicMutationVariables>;
export const UpdateTeamSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeamSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"brandColor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"revealTributes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTeamSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"brandColor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"brandColor"}}},{"kind":"Argument","name":{"kind":"Name","value":"revealTributes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"revealTributes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"revealTributes"}},{"kind":"Field","name":{"kind":"Name","value":"brandColor"}}]}}]}}]} as unknown as DocumentNode<UpdateTeamSettingsMutation, UpdateTeamSettingsMutationVariables>;
export const RequestYearbookExportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestYearbookExport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestYearbookExport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RequestYearbookExportMutation, RequestYearbookExportMutationVariables>;
export const HideTributeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"HideTribute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tributeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hideTribute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tributeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tributeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}}]}}]}}]} as unknown as DocumentNode<HideTributeMutation, HideTributeMutationVariables>;
export const ReportTributeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReportTribute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tributeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportTribute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tributeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tributeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}]}]}}]} as unknown as DocumentNode<ReportTributeMutation, ReportTributeMutationVariables>;