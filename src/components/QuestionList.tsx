import type { Question } from '../types'
import './QuestionList.css'

interface QuestionListProps {
  questions: Question[]
  onUpvote?: (question: Question) => void
  upvotedIds?: Set<string>
  size?: 'default' | 'large'
  emptyMessage?: string
}

export function QuestionList({
  questions,
  onUpvote,
  upvotedIds,
  size = 'default',
  emptyMessage = 'No questions yet.',
}: QuestionListProps) {
  if (questions.length === 0) {
    return <p className="question-list__empty">{emptyMessage}</p>
  }

  return (
    <ol className={`question-list question-list--${size}`}>
      {questions.map((question, index) => {
        const alreadyUpvoted = upvotedIds?.has(question.id) ?? false
        return (
          <li className="question-list__item" key={question.id}>
            <span className="question-list__rank">{index + 1}</span>
            <span className="question-list__text">{question.question_text}</span>
            {onUpvote ? (
              <button
                type="button"
                className={`question-list__upvote${alreadyUpvoted ? ' question-list__upvote--active' : ''}`}
                onClick={() => onUpvote(question)}
                disabled={alreadyUpvoted}
                aria-label="Upvote question"
              >
                <span className="question-list__upvote-arrow">▲</span>
                {question.upvotes}
              </button>
            ) : (
              <span className="question-list__count">{question.upvotes} ▲</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
