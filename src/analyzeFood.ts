export interface FoodAnalysisResult {
  name: string
  vegetable: boolean
  fruit: boolean
  protein: boolean
  carb: boolean
  fat: boolean
  sweet: boolean
  salty: boolean
  processed: boolean
  reason?: string
}

const API_URL = import.meta.env.VITE_ANALYZE_API_URL as string | undefined

export function isAnalysisConfigured(): boolean {
  return !!API_URL
}

export function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
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

export async function analyzeFoodPhoto(data: string, mediaType: string): Promise<FoodAnalysisResult> {
  if (!API_URL) {
    throw new Error('画像判定APIのURLが設定されていません。')
  }

  let response: Response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: data, mediaType }),
    })
  } catch {
    throw new Error('判定サーバーに接続できませんでした。通信環境をご確認ください。')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body && typeof body.error === 'string' ? body.error : null
    throw new Error(message ?? `判定に失敗しました (HTTP ${response.status})`)
  }

  return (await response.json()) as FoodAnalysisResult
}
