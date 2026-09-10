import { useMemo, useState } from 'react'
import { monthGrid, monthLabel, todayKey } from '../dateUtils'
import { getTier, summarizeDay } from '../scoring'
import type { Meal } from '../types'
import './Calendar.css'

const WEEKDAY_HEADERS = ['日', '月', '火', '水', '木', '金', '土']

export function Calendar({
  meals,
  onSelectDate,
}: {
  meals: Meal[]
  onSelectDate: (date: string) => void
}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const cells = useMemo(() => monthGrid(year, month), [year, month])
  const today = todayKey()

  const scoreByDate = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const key of cells) {
      if (!key) continue
      const dayMeals = meals.filter((m) => m.date === key)
      map.set(key, summarizeDay(dayMeals).score)
    }
    return map
  }, [cells, meals])

  function goPrevMonth() {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="calendar">
      <div className="calendar__nav">
        <button onClick={goPrevMonth}>‹</button>
        <h2>{monthLabel(year, month)}</h2>
        <button onClick={goNextMonth}>›</button>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAY_HEADERS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="calendar__grid">
        {cells.map((key, i) => {
          if (!key) return <div key={`empty-${i}`} className="calendar__cell calendar__cell--empty" />
          const score = scoreByDate.get(key) ?? null
          const tier = score !== null ? getTier(score) : null
          const dayNum = Number(key.slice(-2))
          return (
            <button
              key={key}
              className={`calendar__cell ${key === today ? 'calendar__cell--today' : ''}`}
              style={tier ? { background: tier.color } : undefined}
              onClick={() => onSelectDate(key)}
            >
              <span className={tier ? 'calendar__day calendar__day--filled' : 'calendar__day'}>
                {dayNum}
              </span>
            </button>
          )
        })}
      </div>

      <div className="calendar__legend">
        <span>
          <i style={{ background: '#16a34a' }} /> 80-100 Excellent
        </span>
        <span>
          <i style={{ background: '#65a30d' }} /> 60-79 Good
        </span>
        <span>
          <i style={{ background: '#f59e0b' }} /> 40-59 Needs improvement
        </span>
        <span>
          <i style={{ background: '#dc2626' }} /> 0-39 Poor
        </span>
      </div>
    </div>
  )
}
