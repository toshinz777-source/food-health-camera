import { useRef, useState } from 'react'
import {
  emptyTags,
  hasAnyTag,
  MEAL_TYPES,
  MEAL_TYPE_LABEL,
  TAG_OPTIONS,
  type Meal,
  type MealTags,
  type MealType,
} from '../types'
import { guessCurrentMealType, todayKey } from '../dateUtils'
import { scoreMeal, getTier } from '../scoring'
import { analyzeFoodPhoto, fileToBase64, isAnalysisConfigured } from '../analyzeFood'
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
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const analysisTokenRef = useRef(0)

  async function handleFile(file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setPhoto(dataUrl)
      setStep('confirm')
      setError(null)
      setName('')
      setTags(emptyTags())
      setAnalysisError(null)
      runAnalysis(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像の読み込みに失敗しました。')
    }
  }

  async function runAnalysis(file: File) {
    if (!isAnalysisConfigured()) return

    const token = ++analysisTokenRef.current
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const { data, mediaType } = await fileToBase64(file)
      const result = await analyzeFoodPhoto(data, mediaType)
      if (analysisTokenRef.current !== token) return // a newer photo was taken meanwhile

      setName(result.name)
      setTags({
        vegetables: result.vegetable,
        fruit: result.fruit,
        protein: result.protein,
        carbs: result.carb,
        fat: result.fat,
        sweets: result.sweet,
        saltyHigh: result.salty,
        processedHigh: result.processed,
      })
    } catch (err) {
      if (analysisTokenRef.current !== token) return
      setAnalysisError(
        err instanceof Error ? err.message : 'AIによる自動判定に失敗しました。内容を手動で選択してください。',
      )
    } finally {
      if (analysisTokenRef.current === token) setAnalyzing(false)
    }
  }

  function toggleTag(key: keyof MealTags) {
    setTags((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleRetake() {
    analysisTokenRef.current++ // invalidate any in-flight analysis for the discarded photo
    setAnalyzing(false)
    setAnalysisError(null)
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

      {analyzing && (
        <div className="capture__analyzing">
          <span className="capture__spinner" aria-hidden="true" />
          AIが写真を判定しています…
        </div>
      )}

      {analysisError && !analyzing && (
        <p className="capture__analysis-error">
          ⚠️ 自動判定に失敗しました: {analysisError} 内容を手動で選択してください。
        </p>
      )}

      <div className="capture__meal-type">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            className={`capture__chip ${mealType === type ? 'capture__chip--active' : ''}`}
            onClick={() => setMealType(type)}
            disabled={analyzing}
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
        disabled={analyzing}
      />

      <p className="capture__tags-label">この食事に含まれるものをタップして選んでください（複数選択可）</p>

      <div className="capture__tags">
        {TAG_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`capture__tag capture__tag--${opt.kind} ${
              tags[opt.key] ? 'capture__tag--active' : ''
            }`}
            onClick={() => toggleTag(opt.key)}
            disabled={analyzing}
          >
            {tags[opt.key] ? '✓ ' : ''}
            {opt.label}
          </button>
        ))}
      </div>

      {!hasAnyTag(tags) && !analyzing && (
        <p className="capture__tags-warning">
          ⚠️ まだ何も選択されていません。写真は自動判定されないため、内容を選ばないとスコアは基準点のままになります。
        </p>
      )}

      <div className="capture__score-preview" style={{ borderColor: tier.color }}>
        <span>この食事の推定スコア</span>
        <strong style={{ color: tier.color }}>{score}点</strong>
      </div>

      <p className="capture__step-label">ステップ3: 保存</p>
      <button className="capture__save-button" onClick={handleSave} disabled={analyzing}>
        保存する
      </button>
    </div>
  )
}
