export type PollType = 'choice' | 'qa'
export type PollStatus = 'draft' | 'live' | 'closed'

export interface Poll {
  id: string
  title: string
  question: string
  type: PollType
  status: PollStatus
  created_at: string
}

export interface Option {
  id: string
  poll_id: string
  option_text: string
  display_order: number
}

export interface Vote {
  id: string
  poll_id: string
  option_id: string
  created_at: string
}

export interface Question {
  id: string
  poll_id: string
  question_text: string
  upvotes: number
  created_at: string
}
