import type { components } from './generated/schema'

type S = components['schemas']

/** Require listed keys (OpenAPI marks most response fields optional). */
type Req<T, K extends keyof T> = T & Required<Pick<T, K>>

export type Media = Req<S['MediaType'], 'id' | 'url' | 'mimeType'>
export type User = Req<S['UserType'], 'id' | 'email' | 'displayName'>
export type Team = {
  id: string
  name: string
  brandColor?: string
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
export type TeamMember = Req<S['TeamMemberType'], 'id' | 'teamId' | 'nickname'>
export type Invite = Req<S['InviteType'], 'id' | 'teamId' | 'code' | 'role' | 'useCount'>
export type PendingInvite = {
  id: string
  teamId: string
  teamName: string
  role?: string
  createdAt?: string
}
export type Tribute = Req<
  S['TributeType'],
  | 'id'
  | 'teamId'
  | 'writer'
  | 'recipient'
  | 'text'
  | 'anonymous'
  | 'privateTribute'
  | 'published'
  | 'pictures'
  | 'createdAt'
>
export type Memory = Req<
  S['MemoryType'],
  | 'id'
  | 'teamId'
  | 'writer'
  | 'title'
  | 'bodyText'
  | 'privateMemory'
  | 'tagged'
  | 'pictures'
  | 'createdAt'
>
export type Comment = Req<
  S['CommentType'],
  'id' | 'memoryId' | 'writer' | 'text' | 'pictures' | 'createdAt'
>
export type Topic = Req<S['TopicType'], 'id' | 'teamId' | 'title'>
export type TopicStanding = Req<S['TopicStandingType'], 'nominee' | 'score'>
export type Characteristic = Req<S['CharacteristicType'], 'id' | 'teamMemberId' | 'title' | 'count'>
export type SearchHit = Req<S['SearchHitType'], 'type' | 'id' | 'title' | 'snippet'>
export type Yearbook = Req<
  S['YearbookType'],
  | 'teamId'
  | 'orgName'
  | 'teamName'
  | 'title'
  | 'theme'
  | 'brandColor'
  | 'showMembers'
  | 'showTributes'
  | 'showCharacteristics'
  | 'showMemories'
  | 'showAwards'
  | 'members'
  | 'memories'
  | 'topics'
>

export type Connection<T> = {
  items: T[]
  nextCursor?: string | null
  hasNext: boolean
}

export type { components, paths } from './generated/schema'
