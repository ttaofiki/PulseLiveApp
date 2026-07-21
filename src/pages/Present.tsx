import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { BarChart } from '../components/BarChart'
import { QuestionList } from '../components/QuestionList'
import { usePoll } from '../hooks/usePoll'
import { useOptionResults, useQuestions } from '../hooks/usePollResults'
import './Present.css'

export function Present() {
  const { id } = useParams<{ id: string }>()
  const { poll, loading, notFound } = usePoll(id)

  const isChoice = poll?.type === 'choice'
  const optionResults = useOptionResults(isChoice ? id : undefined)
  const questionResults = useQuestions(!isChoice ? id : undefined)

  const voteUrl = id ? `${window.location.origin}/vote/${id}` : ''

  if (loading) {
    return <div className="present present--center">Loading…</div>
  }

  if (notFound || !poll) {
    return <div className="present present--center">Poll not found.</div>
  }

  return (
    <div className="present">
      <div className="present__body">
        <p className="present__eyebrow">{poll.type === 'choice' ? 'Live Poll' : 'Live Q&A'}</p>
        <h1 className="present__question">{poll.question}</h1>

        <div className="present__results">
          {isChoice ? (
            optionResults.options.length > 0 && (
              <BarChart options={optionResults.options} voteCounts={optionResults.voteCounts} size="large" />
            )
          ) : (
            <QuestionList questions={questionResults.questions} size="large" emptyMessage="Waiting for questions…" />
          )}
        </div>
      </div>

      <div className="present__qr">
        <QRCodeSVG value={voteUrl} size={104} bgColor="#ffffff" fgColor="#1e1b2e" level="M" />
        <span className="present__qr-label">Scan to join</span>
      </div>
    </div>
  )
}
