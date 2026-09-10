import type { Meal } from '../types'
import { getTier } from '../scoring'
import './MealCard.css'

export function MealCard({ meal, onDelete }: { meal: Meal; onDelete?: (id: string) => void }) {
  const tier = getTier(meal.score)
  return (
    <div className="meal-card">
      <img src={meal.photo} alt={meal.name || '食事の写真'} className="meal-card__photo" />
      <div className="meal-card__body">
        <p className="meal-card__name">{meal.name || '(名前未入力)'}</p>
        <span className="meal-card__score" style={{ background: tier.color }}>
          {meal.score}点
        </span>
      </div>
      {onDelete && (
        <button
          className="meal-card__delete"
          aria-label="削除"
          onClick={() => onDelete(meal.id)}
        >
          ×
        </button>
      )}
    </div>
  )
}
