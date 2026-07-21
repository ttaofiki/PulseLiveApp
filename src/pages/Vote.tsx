import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { BarChart } from '../components/BarChart'
import { QuestionList } from '../components/QuestionList'
import { usePoll } from '../hooks/usePoll'
import { useOptionResults, useQuestions } from '../hooks/usePollResults'
import { supabase } from '../lib/supabase'
import type { Question } from '../types'
import './Vote.css'

function votedOptionKey(pollId: string) {
  return `pulselive_voted_${pollId}`
}

function upvotedKey(pollId: string) {
  return `pulselive_upvoted_${pollId}`
}

export function Vote() {
  const { id } = useParams<{ id: string }>()
  const { poll, loading, notFound } = usePoll(id)

  const isChoice = poll?.type === 'choice'
  const optionResults = useOptionResults(isChoice ? id : undefined)
  const questionResults = useQuestions(!isChoice ? id : undefined)

  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)

  const [questionText, setQuestionText] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return
    setVotedOptionId(localStorage.getItem(votedOptionKey(id)))
    const stored = localStorage.getItem(upvotedKey(id))
    setUpvotedIds(stored ? new Set(JSON.parse(stored)) : new Set())
  }, [id])

  const castVote = async (optionId: string) => {
    if (!id || voting || votedOptionId) return
    setVoting(true)
    const { error } = await supabase.from('votes').insert({ poll_id: id, option_id: optionId })
    setVoting(false)
    if (error) {
      console.error('Failed to cast vote:', error.message)
      return
    }
    localStorage.setItem(votedOptionKey(id), optionId)
    setVotedOptionId(optionId)
    optionResults.refetch()
  }

  const submitQuestion = async (event: FormEvent) => {
    event.preventDefault()
    if (!id || !questionText.trim()) return
    setSubmittingQuestion(true)
    const { error } = await supabase
      .from('questions')
      .insert({ poll_id: id, question_text: questionText.trim(), upvotes: 0 })
    setSubmittingQuestion(false)
    if (error) {
      console.error('Failed to submit question:', error.message)
      return
    }
    setQuestionText('')
    questionResults.refetch()
  }

  const upvoteQuestion = async (question: Question) => {
    if (!id || upvotedIds.has(question.id)) return
    const { error } = await supabase
      .from('questions')
      .update({ upvotes: question.upvotes + 1 })
      .eq('id', question.id)
    if (error) {
      console.error('Failed to upvote question:', error.message)
      return
    }
    const next = new Set(upvotedIds).add(question.id)
    setUpvotedIds(next)
    localStorage.setItem(upvotedKey(id), JSON.stringify([...next]))
    questionResults.refetch()
  }

  if (loading) {
    return <div className="vote vote--center">Loading…</div>
  }

  if (notFound || !poll) {
    return <div className="vote vote--center">Poll not found.</div>
  }

  if (poll.status !== 'live') {
    return (
      <div className="vote vote--center">
        <div className="vote-closed card">
          <div className="vote-closed__icon">⏸</div>
          <h1>This poll isn't open for responses right now.</h1>
          <p>Check back once the presenter opens voting.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vote">
      <div className="vote-shell">
        <p className="vote-eyebrow">{poll.title}</p>
        <h1 className="vote-question">{poll.question}</h1>

        {isChoice ? (
          votedOptionId ? (
            <div className="vote-thanks">
              <div className="vote-thanks__badge">✓ Thanks for voting!</div>
              <BarChart options={optionResults.options} voteCounts={optionResults.voteCounts} />
            </div>
          ) : (
            <div className="vote-options">
              {optionResults.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="vote-option-btn"
                  onClick={() => castVote(option.id)}
                  disabled={voting}
                >
                  {option.option_text}
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="vote-qa">
            <form className="vote-qa__form" onSubmit={submitQuestion}>
              <textarea
                placeholder="Ask a question…"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                maxLength={280}
              />
              <button type="submit" className="btn btn-primary" disabled={submittingQuestion || !questionText.trim()}>
                {submittingQuestion ? 'Submitting…' : 'Submit question'}
              </button>
            </form>

            <QuestionList
              questions={questionResults.questions}
              onUpvote={upvoteQuestion}
              upvotedIds={upvotedIds}
              emptyMessage="Be the first to ask a question."
            />
          </div>
        )}
      </div>
    </div>
  )
}
