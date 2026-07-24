export const ME = `
  query Me {
    me { id email displayName }
  }
`

export const MY_ORGS = `
  query MyOrganizations {
    myOrganizations { id name brandColor }
  }
`

export const TEAMS = `
  query Teams($organizationId: String!) {
    teams(organizationId: $organizationId) {
      id name brandColor revealTributes tributesRevealed
    }
  }
`

export const TEAM = `
  query Team($id: String!) {
    team(id: $id) {
      id organizationId name brandColor revealTributes revealAt tributesRevealed
    }
  }
`

export const TEAM_MEMBERS = `
  query TeamMembers($teamId: String!, $first: Int, $after: String, $query: String) {
    teamMembers(teamId: $teamId, first: $first, after: $after, query: $query) {
      items { id nickname bio role avatar { url } }
      nextCursor
      hasNext
    }
  }
`

export const TEAM_MEMBER = `
  query TeamMember($id: String!) {
    teamMember(id: $id) { id teamId nickname bio role avatar { url } }
  }
`

export const TRIBUTES = `
  query Tributes($teamId: String!, $recipientId: String, $first: Int, $after: String) {
    tributes(teamId: $teamId, recipientId: $recipientId, first: $first, after: $after) {
      items {
        id text anonymous privateTribute createdAt
        writer { id nickname }
        recipient { id nickname }
      }
      nextCursor
      hasNext
    }
  }
`

export const MEMORIES = `
  query Memories($teamId: String!, $first: Int, $after: String) {
    memories(teamId: $teamId, first: $first, after: $after) {
      items {
        id title bodyText privateMemory createdAt
        writer { id nickname }
        tagged { id nickname }
      }
      nextCursor
      hasNext
    }
  }
`

export const TOPICS = `
  query Topics($teamId: String!) {
    topics(teamId: $teamId) { id title }
  }
`

export const TOPIC_STANDINGS = `
  query TopicStandings($topicId: String!) {
    topicStandings(topicId: $topicId) {
      score
      nominee { id nickname }
    }
  }
`

export const CHARACTERISTICS = `
  query Characteristics($teamMemberId: String!) {
    characteristics(teamMemberId: $teamMemberId) { id title count }
  }
`

export const SEARCH = `
  query Search($teamId: String!, $q: String!, $first: Int, $after: String) {
    search(teamId: $teamId, q: $q, first: $first, after: $after) {
      items { type id title snippet }
      nextCursor
      hasNext
    }
  }
`

export const YEARBOOK_EXPORTS = `
  query YearbookExports($teamId: String!) {
    yearbookExports(teamId: $teamId) {
      id status fileUrl errorMessage createdAt completedAt
    }
  }
`

export const CREATE_ORG = `
  mutation CreateOrganization($name: String!, $brandColor: String) {
    createOrganization(name: $name, brandColor: $brandColor) { id name }
  }
`

export const CREATE_TEAM = `
  mutation CreateTeam($organizationId: String!, $name: String!, $brandColor: String) {
    createTeam(organizationId: $organizationId, name: $name, brandColor: $brandColor) { id name }
  }
`

export const CREATE_INVITE = `
  mutation CreateInvite($teamId: String!, $role: TeamRole, $maxUses: Int) {
    createInvite(teamId: $teamId, role: $role, maxUses: $maxUses) { id code role maxUses }
  }
`

export const JOIN_TEAM = `
  mutation JoinTeam($code: String!, $nickname: String, $bio: String) {
    joinTeam(code: $code, nickname: $nickname, bio: $bio) { id teamId nickname }
  }
`

export const UPSERT_PROFILE = `
  mutation UpsertProfile($teamId: String!, $nickname: String, $bio: String, $avatarId: String) {
    upsertTeamMemberProfile(teamId: $teamId, nickname: $nickname, bio: $bio, avatarId: $avatarId) {
      id nickname bio avatar { url }
    }
  }
`

export const CREATE_TRIBUTE = `
  mutation CreateTribute($teamId: String!, $recipientId: String!, $text: String!, $anonymous: Boolean!, $privateTribute: Boolean!) {
    createTribute(teamId: $teamId, recipientId: $recipientId, text: $text, anonymous: $anonymous, privateTribute: $privateTribute) {
      id text
    }
  }
`

export const CREATE_MEMORY = `
  mutation CreateMemory($teamId: String!, $title: String, $bodyText: String!, $privateMemory: Boolean!, $taggedIds: [String]) {
    createMemory(teamId: $teamId, title: $title, bodyText: $bodyText, privateMemory: $privateMemory, taggedIds: $taggedIds) {
      id title
    }
  }
`

export const CREATE_TOPIC = `
  mutation CreateTopic($teamId: String!, $title: String!) {
    createTopic(teamId: $teamId, title: $title) { id title }
  }
`

export const VOTE_TOPIC = `
  mutation VoteTopic($topicId: String!, $nomineeId: String!, $repetitions: Int) {
    voteTopic(topicId: $topicId, nomineeId: $nomineeId, repetitions: $repetitions)
  }
`

export const ADD_CHARACTERISTIC = `
  mutation AddCharacteristic($teamMemberId: String!, $title: String!) {
    addCharacteristic(teamMemberId: $teamMemberId, title: $title) { id title count }
  }
`

export const UPDATE_TEAM_SETTINGS = `
  mutation UpdateTeamSettings($teamId: String!, $brandColor: String, $revealTributes: Boolean) {
    updateTeamSettings(teamId: $teamId, brandColor: $brandColor, revealTributes: $revealTributes) {
      id revealTributes brandColor
    }
  }
`

export const REQUEST_EXPORT = `
  mutation RequestYearbookExport($teamId: String!) {
    requestYearbookExport(teamId: $teamId) { id status }
  }
`

export const HIDE_TRIBUTE = `
  mutation HideTribute($tributeId: String!) {
    hideTribute(tributeId: $tributeId) { id hidden }
  }
`

export const REPORT_TRIBUTE = `
  mutation ReportTribute($tributeId: String!, $reason: String!) {
    reportTribute(tributeId: $tributeId, reason: $reason)
  }
`
