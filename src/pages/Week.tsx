import { useMemo } from 'react'
import { lastNDays, weekdayLabel } from '../dateUtils'
import { getTier, summarizeDay } from '../scoring'
import type { Meal } from '../types'
import './Week.css'

export function Week({ meals, onSelectDate }: { meals: Meal[]; onSelectDate: (date: string) => void }) {
  const days = useMemo(() => lastNDays(7), [])

  const dayScores = useMemo(
    () =>
      days.map((date) => ({
        date,
        score: summarizeDay(meals.filter((m) => m.date === date)).score,
      })),
    [days, meals],
  )

  const scoredDays = dayScores.filter((d) => d.score !== null)
  const average =
    scoredDays.length > 0
      ? Math.round(scoredDays.reduce((sum, d) => sum + (d.score ?? 0), 0) / scoredDays.length)
      : null

  return (
    <div className="week">
      <h2 className="week__title">直近7日間の健康スコア</h2>

      <div className="week__chart">
        {dayScores.map(({ date, score }) => {
          const tier = score !== null ? getTier(score) : null
          const heightPct = score !== null ? Math.max(6, score) : 4
          return (
            <button key={date} className="week__col" onClick={() => onSelectDate(date)}>
              <span className="week__value">{score ?? '-'}</span>
              <div className="week__bar-track">
                <div
                  className="week__bar"
                  style={{
                    height: `${heightPct}%`,
                    background: tier ? tier.color : '#e5e7eb',
                  }}
                />
              </div>
              <span className="week__weekday">{weekdayLabel(date)}</span>
            </button>
          )
        })}
      </div>

      <div className="week__average">
        <p>週間平均</p>
        <strong>{average !== null ? `${average} / 100` : '記録なし'}</strong>
      </div>
    </div>
  )
}
