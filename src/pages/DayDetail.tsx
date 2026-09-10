import { formatDateJa } from '../dateUtils'
import { summarizeDay } from '../scoring'
import { MEAL_TYPES, MEAL_TYPE_LABEL, type Meal } from '../types'
import { ScoreBadge } from '../components/ScoreBadge'
import { MealCard } from '../components/MealCard'
import './DayDetail.css'

export function DayDetail({
  date,
  meals,
  onBack,
  onDeleteMeal,
}: {
  date: string
  meals: Meal[]
  onBack: () => void
  onDeleteMeal: (id: string) => void
}) {
  const dayMeals = meals.filter((m) => m.date === date)
  const summary = summarizeDay(dayMeals)

  return (
    <div className="day-detail">
      <header className="day-detail__header">
        <button className="day-detail__back" onClick={onBack}>
          ← カレンダーに戻る
        </button>
      </header>

      <p className="day-detail__date">{formatDateJa(date)}</p>

      <div className="day-detail__score-row">
        <ScoreBadge score={summary.score} />
      </div>

      {dayMeals.length === 0 ? (
        <p className="day-detail__empty">この日の記録はありません。</p>
      ) : (
        <>
          {summary.goodPoints.length > 0 && (
            <div className="day-detail__summary">
              {summary.goodPoints.map((p, i) => (
                <p key={`g-${i}`} className="day-detail__good">
                  👍 {p}
                </p>
              ))}
              {summary.improvementPoints.map((p, i) => (
                <p key={`i-${i}`} className="day-detail__improve">
                  💡 {p}
                </p>
              ))}
            </div>
          )}

          <div className="day-detail__meals">
            {MEAL_TYPES.map((type) => {
              const list = dayMeals.filter((m) => m.mealType === type)
              if (list.length === 0) return null
              return (
                <div key={type} className="day-detail__group">
                  <h3>{MEAL_TYPE_LABEL[type]}</h3>
                  <div className="day-detail__list">
                    {list.map((meal) => (
                      <MealCard key={meal.id} meal={meal} onDelete={onDeleteMeal} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
