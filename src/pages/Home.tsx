import { formatDateJa, todayKey } from '../dateUtils'
import { summarizeDay } from '../scoring'
import { MEAL_TYPES, MEAL_TYPE_LABEL, type Meal } from '../types'
import { ScoreBadge } from '../components/ScoreBadge'
import { MealCard } from '../components/MealCard'
import './Home.css'

export function Home({
  meals,
  onOpenCapture,
  onDeleteMeal,
}: {
  meals: Meal[]
  onOpenCapture: () => void
  onDeleteMeal: (id: string) => void
}) {
  const today = todayKey()
  const todaysMeals = meals.filter((m) => m.date === today)
  const summary = summarizeDay(todaysMeals)

  return (
    <div className="home">
      <p className="home__date">{formatDateJa(today)}</p>

      <div className="home__score-row">
        <ScoreBadge score={summary.score} />
        <div className="home__score-text">
          <p className="home__score-title">今日の健康スコア</p>
          {summary.score !== null && <p className="home__score-value">{summary.score} / 100</p>}
          {summary.score === null && <p className="home__score-hint">まだ記録がありません</p>}
        </div>
      </div>

      <button className="home__capture-button" onClick={onOpenCapture}>
        📷 食事を撮影
      </button>

      {summary.score !== null && (
        <div className="home__summary">
          {summary.goodPoints.map((p, i) => (
            <p key={`good-${i}`} className="home__summary-good">
              👍 {p}
            </p>
          ))}
          {summary.improvementPoints.map((p, i) => (
            <p key={`improve-${i}`} className="home__summary-improve">
              💡 {p}
            </p>
          ))}
        </div>
      )}

      <div className="home__meals">
        {MEAL_TYPES.map((type) => {
          const list = todaysMeals.filter((m) => m.mealType === type)
          return (
            <div key={type} className="home__meal-group">
              <h3>{MEAL_TYPE_LABEL[type]}</h3>
              {list.length === 0 ? (
                <p className="home__meal-empty">記録なし</p>
              ) : (
                <div className="home__meal-list">
                  {list.map((meal) => (
                    <MealCard key={meal.id} meal={meal} onDelete={onDeleteMeal} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="home__disclaimer">
        ※ このアプリは医療診断をするものではありません。食生活を振り返るための参考情報としてご利用ください。
      </p>
    </div>
  )
}
