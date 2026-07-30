/**
 * Stable import path for app code.
 * Documents are generated from graphql/operations + graphql/schema.graphql —
 * run `./mvnw -Pgraphql-codegen generate-sources` (or `npm run graphql:generate`).
 */
export {
  MeDocument as ME,
  UpdateMyProfileDocument as UPDATE_MY_PROFILE,
  MyTeamMembershipDocument as MY_TEAM_MEMBERSHIP,
  MyOrganizationsDocument as MY_ORGS,
  TeamsDocument as TEAMS,
  TeamDocument as TEAM,
  TeamMembersDocument as TEAM_MEMBERS,
  TeamMemberDocument as TEAM_MEMBER,
  TributesDocument as TRIBUTES,
  MemoriesDocument as MEMORIES,
  TopicsDocument as TOPICS,
  TopicStandingsDocument as TOPIC_STANDINGS,
  CharacteristicsDocument as CHARACTERISTICS,
  SearchDocument as SEARCH,
  YearbookExportsDocument as YEARBOOK_EXPORTS,
  YearbookDocument as YEARBOOK,
  UpdateYearbookSettingsDocument as UPDATE_YEARBOOK_SETTINGS,
  CreateOrganizationDocument as CREATE_ORG,
  CreateTeamDocument as CREATE_TEAM,
  CreateInviteDocument as CREATE_INVITE,
  InviteByEmailDocument as INVITE_BY_EMAIL,
  JoinTeamDocument as JOIN_TEAM,
  UpsertProfileDocument as UPSERT_PROFILE,
  CreateTributeDocument as CREATE_TRIBUTE,
  CreateMemoryDocument as CREATE_MEMORY,
  CreateTopicDocument as CREATE_TOPIC,
  VoteTopicDocument as VOTE_TOPIC,
  AddCharacteristicDocument as ADD_CHARACTERISTIC,
  UpdateTeamSettingsDocument as UPDATE_TEAM_SETTINGS,
  RequestYearbookExportDocument as REQUEST_EXPORT,
  HideTributeDocument as HIDE_TRIBUTE,
  ReportTributeDocument as REPORT_TRIBUTE,
} from './generated/graphql'

export type * from './generated/graphql'
