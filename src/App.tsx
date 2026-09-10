import { useRef, useState } from 'react'
import './App.css'
import { analyzeFoodImage, type FoodAnalysis } from './analyzeFood'

const API_KEY_STORAGE_KEY = 'food-check-api-key'

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [, data] = result.split(',')
      resolve({ data, mediaType: file.type || 'image/jpeg' })
    }
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました。'))
    reader.readAsDataURL(file)
  })
}

const confidenceLabel: Record<FoodAnalysis['confidence'], string> = {
  high: '高い',
  medium: '中程度',
  low: '低い',
}

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) ?? '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(() => !localStorage.getItem(API_KEY_STORAGE_KEY))
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FoodAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSaveApiKey(key: string) {
    setApiKey(key)
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
    setShowApiKeyInput(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setResult(null)
    setError(null)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleAnalyze() {
    if (!imageFile) return
    if (!apiKey) {
      setShowApiKeyInput(true)
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data, mediaType } = await fileToBase64(imageFile)
      const analysis = await analyzeFoodImage(apiKey, data, mediaType)
      setResult(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="page">
      <header className="header">
        <h1>🍽️ 食べ物・栄養チェック</h1>
        <p className="subtitle">写真をアップロードすると、食べ物とおおよその栄養情報を判定します</p>
        <button className="link-button" onClick={() => setShowApiKeyInput(true)}>
          APIキー設定
        </button>
      </header>

      {showApiKeyInput && (
        <ApiKeyModal
          initialValue={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyInput(false)}
          canClose={!!apiKey}
        />
      )}

      <main className="main">
        <div className="upload-card">
          {imagePreview ? (
            <img src={imagePreview} alt="アップロードされた食べ物" className="preview-image" />
          ) : (
            <div className="upload-placeholder">
              <span>📷</span>
              <p>写真を選択してください</p>
            </div>
          )}

          <div className="upload-actions">
            <label className="button secondary">
              写真を選ぶ
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                hidden
              />
            </label>
            {imageFile && (
              <button className="button secondary" onClick={handleReset} disabled={loading}>
                リセット
              </button>
            )}
            <button
              className="button primary"
              onClick={handleAnalyze}
              disabled={!imageFile || loading}
            >
              {loading ? '解析中…' : '栄養を判定する'}
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h2>{result.foodName}</h2>
              <span className={`confidence confidence-${result.confidence}`}>
                判定精度: {confidenceLabel[result.confidence]}
              </span>
            </div>
            <p className="serving">目安量: 約{result.estimatedServingGrams}g</p>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="value">{result.calories}</span>
                <span className="label">kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="value">{result.proteinGrams}g</span>
                <span className="label">タンパク質</span>
              </div>
              <div className="nutrition-item">
                <span className="value">{result.fatGrams}g</span>
                <span className="label">脂質</span>
              </div>
              <div className="nutrition-item">
                <span className="value">{result.carbsGrams}g</span>
                <span className="label">炭水化物</span>
              </div>
            </div>
            {result.healthNotes && <p className="health-notes">💡 {result.healthNotes}</p>}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>※ 表示される栄養情報はAIによる概算です。正確な数値は成分表示等でご確認ください。</p>
      </footer>
    </div>
  )
}

function ApiKeyModal({
  initialValue,
  onSave,
  onClose,
  canClose,
}: {
  initialValue: string
  onSave: (key: string) => void
  onClose: () => void
  canClose: boolean
}) {
  const [value, setValue] = useState(initialValue)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Anthropic APIキー</h2>
        <p>
          このアプリは画像解析にAnthropic APIを直接呼び出します。APIキーはブラウザ内（localStorage）にのみ保存され、
          外部サーバーには送信されません。
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-..."
          className="api-key-input"
        />
        <div className="modal-actions">
          {canClose && (
            <button className="button secondary" onClick={onClose}>
              キャンセル
            </button>
          )}
          <button
            className="button primary"
            onClick={() => value.trim() && onSave(value.trim())}
            disabled={!value.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
