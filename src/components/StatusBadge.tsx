import type { PollStatus } from '../types'
import './StatusBadge.css'

const LABELS: Record<PollStatus, string> = {
  draft: 'Draft',
  live: 'Live',
  closed: 'Closed',
}

export function StatusBadge({ status }: { status: PollStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status === 'live' && <span className="status-badge__dot" />}
      {LABELS[status]}
    </span>
  )
}
