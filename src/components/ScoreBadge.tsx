import { getTier } from '../scoring'
import './ScoreBadge.css'

export function ScoreBadge({ score, size = 'large' }: { score: number | null; size?: 'large' | 'small' }) {
  if (score === null) {
    return (
      <div className={`score-badge score-badge--${size} score-badge--empty`}>
        <span className="score-badge__value">--</span>
        <span className="score-badge__label">記録なし</span>
      </div>
    )
  }

  const tier = getTier(score)

  return (
    <div
      className={`score-badge score-badge--${size}`}
      style={{ borderColor: tier.color, color: tier.color }}
    >
      <span className="score-badge__value">{score}</span>
      <span className="score-badge__label" style={{ color: tier.color }}>
        {tier.label}
      </span>
    </div>
  )
}
