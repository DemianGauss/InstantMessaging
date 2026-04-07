export type Participant = {
  id: number
  username: string
}

export type ChatRoom = {
  id: number
  room_type: 'direct' | 'group'
  name: string
  participants: Participant[]
  created_at: string
  updated_at: string
}

export type Message = {
  id: number
  room: number
  sender: Participant
  content: string
  timestamp: string
  updated_at: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
