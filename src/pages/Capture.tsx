import { useRef, useState } from 'react'
import { emptyTags, MEAL_TYPES, MEAL_TYPE_LABEL, type Meal, type MealTags, type MealType } from '../types'
import { guessCurrentMealType, todayKey } from '../dateUtils'
import { scoreMeal, getTier } from '../scoring'
import './Capture.css'

type Step = 'capture' | 'confirm'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました。'))
    reader.readAsDataURL(file)
  })
}

const TAG_OPTIONS: { key: keyof MealTags; label: string; kind: 'positive' | 'warning' }[] = [
  { key: 'vegetables', label: '野菜', kind: 'positive' },
  { key: 'fruit', label: '果物', kind: 'positive' },
  { key: 'protein', label: 'タンパク質', kind: 'positive' },
  { key: 'carbs', label: '炭水化物', kind: 'positive' },
  { key: 'fat', label: '脂質', kind: 'positive' },
  { key: 'sweets', label: '甘い物', kind: 'warning' },
  { key: 'saltyHigh', label: '塩分が多そう', kind: 'warning' },
  { key: 'processedHigh', label: '加工食品が多そう', kind: 'warning' },
]

export function Capture({
  onSave,
  onCancel,
}: {
  onSave: (meal: Meal) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<Step>('capture')
  const [photo, setPhoto] = useState<string | null>(null)
  const [mealType, setMealType] = useState<MealType>(guessCurrentMealType())
  const [name, setName] = useState('')
  const [tags, setTags] = useState<MealTags>(emptyTags())
  const [error, setError] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setPhoto(dataUrl)
      setStep('confirm')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像の読み込みに失敗しました。')
    }
  }

  function toggleTag(key: keyof MealTags) {
    setTags((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleRetake() {
    setPhoto(null)
    setStep('capture')
  }

  function handleSave() {
    if (!photo) return
    const score = scoreMeal(tags)
    const meal: Meal = {
      id: crypto.randomUUID(),
      date: todayKey(),
      mealType,
      name: name.trim(),
      photo,
      score,
      createdAt: Date.now(),
      ...tags,
    }
    onSave(meal)
  }

  if (step === 'capture') {
    return (
      <div className="capture">
        <header className="capture__header">
          <button className="capture__back" onClick={onCancel}>
            ← 戻る
          </button>
          <h2>食事を撮影</h2>
        </header>

        <p className="capture__step-label">ステップ1: 写真を撮る</p>

        <div className="capture__meal-type">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              className={`capture__chip ${mealType === type ? 'capture__chip--active' : ''}`}
              onClick={() => setMealType(type)}
            >
              {MEAL_TYPE_LABEL[type]}
            </button>
          ))}
        </div>

        {error && <div className="capture__error">{error}</div>}

        <div className="capture__actions">
          <button className="capture__big-button" onClick={() => cameraInputRef.current?.click()}>
            📷 写真を撮る
          </button>
          <button
            className="capture__big-button capture__big-button--secondary"
            onClick={() => galleryInputRef.current?.click()}
          >
            🖼️ アルバムから選ぶ
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  const score = scoreMeal(tags)
  const tier = getTier(score)

  return (
    <div className="capture">
      <header className="capture__header">
        <button className="capture__back" onClick={handleRetake}>
          ← 撮り直す
        </button>
        <h2>食事を確認</h2>
      </header>

      <p className="capture__step-label">ステップ2: 内容を確認・修正</p>

      {photo && <img src={photo} alt="撮影した食事" className="capture__preview" />}

      <div className="capture__meal-type">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            className={`capture__chip ${mealType === type ? 'capture__chip--active' : ''}`}
            onClick={() => setMealType(type)}
          >
            {MEAL_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      <input
        className="capture__name-input"
        type="text"
        placeholder="食べ物の名前（例：鮭の塩焼き定食）"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="capture__tags">
        {TAG_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`capture__tag capture__tag--${opt.kind} ${
              tags[opt.key] ? 'capture__tag--active' : ''
            }`}
            onClick={() => toggleTag(opt.key)}
          >
            {tags[opt.key] ? '✓ ' : ''}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="capture__score-preview" style={{ borderColor: tier.color }}>
        <span>この食事の推定スコア</span>
        <strong style={{ color: tier.color }}>{score}点</strong>
      </div>

      <p className="capture__step-label">ステップ3: 保存</p>
      <button className="capture__save-button" onClick={handleSave}>
        保存する
      </button>
    </div>
  )
}
