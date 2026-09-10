export interface FoodAnalysis {
  foodName: string
  confidence: 'high' | 'medium' | 'low'
  estimatedServingGrams: number
  calories: number
  proteinGrams: number
  fatGrams: number
  carbsGrams: number
  healthNotes: string
}

const MODEL = 'claude-sonnet-5'

const SYSTEM_PROMPT = `あなたは栄養士アシスタントです。ユーザーがアップロードした食べ物の写真を見て、写っている食べ物・料理を推定し、
一般的な1人前の目安量に基づく概算の栄養情報を日本語で答えてください。
必ず次のJSON形式のみを出力してください（説明文やコードブロックは不要です）:

{
  "foodName": "料理名",
  "confidence": "high" | "medium" | "low",
  "estimatedServingGrams": 数値,
  "calories": 数値,
  "proteinGrams": 数値,
  "fatGrams": 数値,
  "carbsGrams": 数値,
  "healthNotes": "健康面での簡単なアドバイスやコメント（1〜2文）"
}

写真に食べ物が写っていない、または判別できない場合は foodName を "不明" とし、confidence を "low" にしてください。
数値はすべて概算で構いませんが、必ず数値型（文字列にしない）で出力してください。`

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('AIの応答からJSONを取得できませんでした。')
  }
  return JSON.parse(match[0])
}

export async function analyzeFoodImage(
  apiKey: string,
  base64Data: string,
  mediaType: string,
): Promise<FoodAnalysis> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: 'この写真の食べ物を判定し、栄養情報をJSONで教えてください。',
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    if (response.status === 401) {
      throw new Error('APIキーが正しくないか、権限がありません。')
    }
    throw new Error(`APIエラー (${response.status}): ${body.slice(0, 200)}`)
  }

  const data = await response.json()
  const text: string = data?.content?.[0]?.text ?? ''
  const parsed = extractJson(text) as Partial<FoodAnalysis>

  return {
    foodName: parsed.foodName ?? '不明',
    confidence: parsed.confidence ?? 'low',
    estimatedServingGrams: Number(parsed.estimatedServingGrams) || 0,
    calories: Number(parsed.calories) || 0,
    proteinGrams: Number(parsed.proteinGrams) || 0,
    fatGrams: Number(parsed.fatGrams) || 0,
    carbsGrams: Number(parsed.carbsGrams) || 0,
    healthNotes: parsed.healthNotes ?? '',
  }
}
