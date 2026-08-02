export type Media = {
  id: string
  url: string
  mimeType: string
}

export type User = {
  id: string
  email: string
  displayName: string
}

export type Organization = {
  id: string
  name: string
  brandColor: string
  logo?: Media | null
}

export type Team = {
  id: string
  organizationId: string
  name: string
  brandColor: string
  coverMedia?: Media | null
  revealTributes: boolean
  revealAt?: string | null
  tributesRevealed: boolean
  yearbookTitle?: string | null
  yearbookSubtitle?: string | null
  yearbookDedication?: string | null
  yearbookTheme?: string | null
  yearbookShowMembers: boolean
  yearbookShowTributes: boolean
  yearbookShowCharacteristics: boolean
  yearbookShowMemories: boolean
  yearbookShowAwards: boolean
}

export type TeamMember = {
  id: string
  teamId: string
  userId?: string | null
  nickname: string
  bio?: string | null
  role?: string | null
  avatar?: Media | null
}

export type Invite = {
  id: string
  teamId: string
  code: string
  role: string
  maxUses?: number | null
  useCount: number
  expiresAt?: string | null
  email?: string | null
}

export type Tribute = {
  id: string
  teamId: string
  writer: TeamMember
  recipient: TeamMember
  text: string
  anonymous: boolean
  privateTribute: boolean
  hidden: boolean
  pictures: Media[]
  createdAt: string
}

export type Memory = {
  id: string
  teamId: string
  writer: TeamMember
  title: string
  bodyText: string
  privateMemory: boolean
  tagged: TeamMember[]
  pictures: Media[]
  createdAt: string
}

export type Comment = {
  id: string
  memoryId: string
  writer: TeamMember
  text: string
  createdAt: string
}

export type Topic = {
  id: string
  teamId: string
  title: string
}

export type TopicStanding = {
  nominee: TeamMember
  score: number
}

export type Characteristic = {
  id: string
  teamMemberId: string
  title: string
  count: number
}

export type YearbookExport = {
  id: string
  teamId: string
  status: string
  fileUrl?: string | null
  errorMessage?: string | null
  createdAt: string
  completedAt?: string | null
}

export type SearchHit = {
  type: string
  id: string
  title: string
  snippet: string
}

export type Connection<T> = {
  items: T[]
  nextCursor?: string | null
  hasNext: boolean
}

export type Yearbook = {
  teamId: string
  orgName: string
  teamName: string
  title: string
  subtitle?: string | null
  dedication?: string | null
  theme: string
  brandColor: string
  logoUrl?: string | null
  coverMediaUrl?: string | null
  showMembers: boolean
  showTributes: boolean
  showCharacteristics: boolean
  showMemories: boolean
  showAwards: boolean
  members: Array<{
    nickname: string
    bio?: string | null
    avatarUrl?: string | null
    characteristics: Array<{ title: string; count: number }>
    tributes: Array<{ text: string; writer: string }>
  }>
  memories: Array<{
    title: string
    body: string
    writer: string
    imageUrls: string[]
  }>
  topics: Array<{
    title: string
    standings: Array<{ nickname: string; score: number }>
  }>
}
