import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { StatusBadge } from '../components/StatusBadge'
import { usePolls } from '../hooks/usePolls'
import './Dashboard.css'

const TYPE_LABELS = {
  choice: 'Multiple Choice',
  qa: 'Q&A',
}

export function Dashboard() {
  const { polls, responseCounts, loading } = usePolls()

  return (
    <div>
      <Header />
      <div className="page-shell">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Your polls</h1>
            <p className="dash-subtitle">Create and manage live audience polls and Q&A sessions.</p>
          </div>
          <Link to="/create" className="btn btn-primary">
            + Create New Poll
          </Link>
        </div>

        {loading ? (
          <div className="dash-loading">Loading polls…</div>
        ) : polls.length === 0 ? (
          <div className="dash-empty card">
            <div className="dash-empty__icon">✦</div>
            <h2>No polls yet</h2>
            <p>Create your first poll to start collecting live responses from your audience.</p>
            <Link to="/create" className="btn btn-primary">
              + Create New Poll
            </Link>
          </div>
        ) : (
          <div className="dash-grid">
            {polls.map((poll) => (
              <Link to={`/poll/${poll.id}`} className="dash-card card" key={poll.id}>
                <div className="dash-card__top">
                  <span className="dash-card__type">{TYPE_LABELS[poll.type]}</span>
                  <StatusBadge status={poll.status} />
                </div>
                <h3 className="dash-card__title">{poll.title}</h3>
                <p className="dash-card__question">{poll.question}</p>
                <div className="dash-card__footer">
                  {responseCounts[poll.id] ?? 0} {responseCounts[poll.id] === 1 ? 'response' : 'responses'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
