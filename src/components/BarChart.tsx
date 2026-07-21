import type { Option } from '../types'
import './BarChart.css'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)']

interface BarChartProps {
  options: Option[]
  voteCounts: Record<string, number>
  size?: 'default' | 'large'
}

export function BarChart({ options, voteCounts, size = 'default' }: BarChartProps) {
  const total = options.reduce((sum, option) => sum + (voteCounts[option.id] ?? 0), 0)
  const maxCount = Math.max(1, ...options.map((option) => voteCounts[option.id] ?? 0))

  return (
    <div className={`bar-chart bar-chart--${size}`}>
      {options.map((option, index) => {
        const count = voteCounts[option.id] ?? 0
        const percent = total > 0 ? Math.round((count / total) * 100) : 0
        const widthPercent = (count / maxCount) * 100

        return (
          <div className="bar-chart__row" key={option.id}>
            <div className="bar-chart__label">
              <span className="bar-chart__option-text">{option.option_text}</span>
              <span className="bar-chart__stats">
                {count} {count === 1 ? 'vote' : 'votes'} · {percent}%
              </span>
            </div>
            <div className="bar-chart__track">
              <div
                className="bar-chart__fill"
                style={{ width: `${widthPercent}%`, background: COLORS[index % COLORS.length] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
