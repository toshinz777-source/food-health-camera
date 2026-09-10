import { TAG_OPTIONS, type Meal } from '../types'
import { getTier } from '../scoring'
import './MealCard.css'

export function MealCard({ meal, onDelete }: { meal: Meal; onDelete?: (id: string) => void }) {
  const tier = getTier(meal.score)
  const activeTags = TAG_OPTIONS.filter((opt) => meal[opt.key])
  return (
    <div className="meal-card">
      <img src={meal.photo} alt={meal.name || '食事の写真'} className="meal-card__photo" />
      <div className="meal-card__body">
        <p className="meal-card__name">{meal.name || '(名前未入力)'}</p>
        <span className="meal-card__score" style={{ background: tier.color }}>
          {meal.score}点
        </span>
        {activeTags.length > 0 ? (
          <div className="meal-card__tags">
            {activeTags.map((opt) => (
              <span key={opt.key} className={`meal-card__tag meal-card__tag--${opt.kind}`}>
                {opt.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="meal-card__no-tags">内容未選択（基準点）</p>
        )}
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
