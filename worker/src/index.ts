import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import * as z from 'zod/v4'

export interface Env {
  ANTHROPIC_API_KEY: string
  ALLOWED_ORIGIN?: string
}

const MODEL = 'claude-sonnet-5'

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number]

function isAllowedMediaType(value: string): value is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value)
}

const FoodAnalysisSchema = z.object({
  name: z.string().describe('料理名(日本語)'),
  vegetable: z.boolean().describe('野菜が含まれる'),
  fruit: z.boolean().describe('果物が含まれる'),
  protein: z.boolean().describe('肉・魚・卵・大豆製品などタンパク質が豊富'),
  carb: z.boolean().describe('ご飯・パン・麺など炭水化物が中心'),
  fat: z.boolean().describe('油を多く使っている、または脂質が多そう'),
  sweet: z.boolean().describe('甘いお菓子・デザート・砂糖の多い飲み物'),
  salty: z.boolean().describe('味付けが濃く塩分が多そう'),
  processed: z.boolean().describe('加工食品・インスタント食品が多い'),
  reason: z.string().describe('判定理由を日本語で1文').optional(),
})

const SYSTEM_PROMPT = `あなたは食事の写真を見て、料理名と栄養カテゴリを判定するアシスタントです。
写真に写っている食べ物を分析し、指定されたスキーマの各カテゴリについて該当するかどうかを判定してください。
判断がつきにくい場合は、見た目から最も妥当と思われる判定をしてください。
reasonには、判定の簡単な理由を日本語で1文書いてください。`

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function jsonResponse(data: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

interface AnalyzeRequestBody {
  image?: unknown
  mediaType?: unknown
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN ?? 'https://toshinz777-source.github.io'

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(allowedOrigin) })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method Not Allowed' }, 405, allowedOrigin)
    }

    const url = new URL(request.url)
    if (url.pathname !== '/analyze') {
      return jsonResponse({ error: 'Not Found' }, 404, allowedOrigin)
    }

    let body: AnalyzeRequestBody
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'リクエストの形式が正しくありません。' }, 400, allowedOrigin)
    }

    if (typeof body.image !== 'string' || !body.image) {
      return jsonResponse({ error: '画像データ(image)が必要です。' }, 400, allowedOrigin)
    }
    if (typeof body.mediaType !== 'string' || !isAllowedMediaType(body.mediaType)) {
      return jsonResponse(
        { error: `mediaTypeは次のいずれかである必要があります: ${ALLOWED_MEDIA_TYPES.join(', ')}` },
        400,
        allowedOrigin,
      )
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'サーバー側にAPIキーが設定されていません。' }, 500, allowedOrigin)
    }

    try {
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

      const response = await client.messages.parse({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: body.mediaType, data: body.image },
              },
              { type: 'text', text: 'この食事の写真を分析してください。' },
            ],
          },
        ],
        output_config: { format: zodOutputFormat(FoodAnalysisSchema) },
      })

      if (!response.parsed_output) {
        return jsonResponse({ error: 'AIの応答を解析できませんでした。' }, 502, allowedOrigin)
      }

      return jsonResponse(response.parsed_output, 200, allowedOrigin)
    } catch (err) {
      console.error('Claude API error', err)
      const message =
        err instanceof Anthropic.APIError
          ? `判定処理でエラーが発生しました (${err.status ?? '不明'})`
          : '判定処理でエラーが発生しました。'
      return jsonResponse({ error: message }, 502, allowedOrigin)
    }
  },
}
