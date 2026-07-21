import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { StatusBadge } from '../components/StatusBadge'
import { QrCodeBlock } from '../components/QrCodeBlock'
import { BarChart } from '../components/BarChart'
import { QuestionList } from '../components/QuestionList'
import { usePoll } from '../hooks/usePoll'
import { useOptionResults, useQuestions } from '../hooks/usePollResults'
import { supabase } from '../lib/supabase'
import './PollManagement.css'

export function PollManagement() {
  const { id } = useParams<{ id: string }>()
  const { poll, loading, notFound, refetch: refetchPoll } = usePoll(id)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [resetting, setResetting] = useState(false)

  const isChoice = poll?.type === 'choice'
  const optionResults = useOptionResults(isChoice ? id : undefined)
  const questionResults = useQuestions(!isChoice ? id : undefined)

  const voteUrl = id ? `${window.location.origin}/vote/${id}` : ''

  const toggleStatus = async () => {
    if (!poll || !id) return
    setUpdatingStatus(true)
    const nextStatus = poll.status === 'live' ? 'closed' : 'live'
    const { error } = await supabase.from('polls').update({ status: nextStatus }).eq('id', id)
    setUpdatingStatus(false)
    if (error) {
      console.error('Failed to update poll status:', error.message)
      return
    }
    refetchPoll()
  }

  const resetResults = async () => {
    if (!poll || !id) return
    const confirmed = window.confirm('This will permanently clear all responses for this poll. Continue?')
    if (!confirmed) return
    setResetting(true)
    const { error } =
      poll.type === 'choice'
        ? await supabase.from('votes').delete().eq('poll_id', id)
        : await supabase.from('questions').delete().eq('poll_id', id)
    setResetting(false)
    if (error) {
      console.error('Failed to reset results:', error.message)
      return
    }
    if (poll.type === 'choice') {
      optionResults.refetch()
    } else {
      questionResults.refetch()
    }
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="page-shell mgmt-loading">Loading poll…</div>
      </div>
    )
  }

  if (notFound || !poll) {
    return (
      <div>
        <Header />
        <div className="page-shell mgmt-loading">Poll not found.</div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="page-shell">
        <div className="mgmt-top">
          <div>
            <div className="mgmt-status-row">
              <StatusBadge status={poll.status} />
              <span className="mgmt-type">{poll.type === 'choice' ? 'Multiple Choice' : 'Q&A'}</span>
            </div>
            <h1 className="mgmt-title">{poll.title}</h1>
            <p className="mgmt-question">{poll.question}</p>
          </div>
        </div>

        <div className="mgmt-grid">
          <div className="card mgmt-panel mgmt-panel--share">
            <h2 className="mgmt-panel-title">Join the poll</h2>
            <QrCodeBlock url={voteUrl} />
            <div className="mgmt-controls">
              <button type="button" className="btn btn-primary" onClick={toggleStatus} disabled={updatingStatus}>
                {poll.status === 'live' ? 'Close voting' : 'Open voting'}
              </button>
              <Link to={`/poll/${id}/present`} className="btn btn-secondary">
                Present
              </Link>
            </div>
          </div>

          <div className="card mgmt-panel mgmt-panel--results">
            <div className="mgmt-panel-header">
              <h2 className="mgmt-panel-title">Live results</h2>
              <button type="button" className="btn btn-danger mgmt-reset" onClick={resetResults} disabled={resetting}>
                Reset results
              </button>
            </div>

            {isChoice ? (
              optionResults.options.length === 0 ? (
                <p className="mgmt-empty">No options found for this poll.</p>
              ) : (
                <BarChart options={optionResults.options} voteCounts={optionResults.voteCounts} />
              )
            ) : (
              <QuestionList questions={questionResults.questions} emptyMessage="No questions submitted yet." />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
