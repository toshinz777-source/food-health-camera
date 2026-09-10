import type { Meal, MealTags } from './types'

const BASE_SCORE = 60

const WEIGHTS: Record<keyof MealTags, number> = {
  vegetables: 12,
  fruit: 8,
  protein: 12,
  carbs: 3,
  fat: -5,
  sweets: -15,
  saltyHigh: -10,
  processedHigh: -10,
}

export function scoreMeal(tags: MealTags): number {
  let score = BASE_SCORE
  for (const key of Object.keys(WEIGHTS) as (keyof MealTags)[]) {
    if (tags[key]) score += WEIGHTS[key]
  }
  return Math.max(0, Math.min(100, Math.round(score)))
}

export interface Tier {
  key: 'excellent' | 'good' | 'needsImprovement' | 'poor'
  label: string
  color: string
}

export function getTier(score: number): Tier {
  if (score >= 80) return { key: 'excellent', label: 'Excellent', color: '#16a34a' }
  if (score >= 60) return { key: 'good', label: 'Good', color: '#65a30d' }
  if (score >= 40) return { key: 'needsImprovement', label: 'Needs improvement', color: '#f59e0b' }
  return { key: 'poor', label: 'Poor', color: '#dc2626' }
}

export interface DaySummary {
  score: number | null
  goodPoints: string[]
  improvementPoints: string[]
}

export function summarizeDay(meals: Meal[]): DaySummary {
  if (meals.length === 0) {
    return { score: null, goodPoints: [], improvementPoints: [] }
  }

  const avg = meals.reduce((sum, m) => sum + m.score, 0) / meals.length
  const score = Math.round(avg)
  const total = meals.length

  const count = (key: keyof MealTags) => meals.filter((m) => m[key]).length

  const vegRatio = count('vegetables') / total
  const fruitRatio = count('fruit') / total
  const proteinRatio = count('protein') / total
  const sweetsCount = count('sweets')
  const saltyCount = count('saltyHigh')
  const processedCount = count('processedHigh')
  const fatCount = count('fat')

  const goodPoints: string[] = []
  const improvementPoints: string[] = []

  if (vegRatio >= 0.5 && proteinRatio >= 0.5) {
    goodPoints.push('野菜とタンパク質が十分に取れています。')
  } else if (vegRatio >= 0.5) {
    goodPoints.push('野菜をしっかり摂れています。')
  } else if (proteinRatio >= 0.5) {
    goodPoints.push('タンパク質をしっかり摂れています。')
  }

  if (fruitRatio >= 0.5) {
    goodPoints.push('果物を適度に取り入れられています。')
  }

  if (goodPoints.length === 0) {
    goodPoints.push('毎日記録を続けられています。まずはそれが大切な一歩です。')
  }

  if (sweetsCount >= 2) {
    improvementPoints.push('今日は甘い物が少し多めです。明日は間食を1回減らしてみましょう。')
  } else if (sweetsCount === 1) {
    improvementPoints.push('甘い物を1回取っています。食べ過ぎなければ問題ありません。')
  }

  if (saltyCount >= 2) {
    improvementPoints.push('塩分が多い食事が続いています。次は薄味を意識してみましょう。')
  }

  if (processedCount >= 2) {
    improvementPoints.push('加工食品が多めです。野菜や果物を1品増やしてみましょう。')
  }

  if (fatCount >= 2) {
    improvementPoints.push('脂質の多い食事が続いています。次は揚げ物以外を選んでみましょう。')
  }

  if (vegRatio < 0.3) {
    improvementPoints.push('野菜が不足気味です。次の食事に1品追加してみましょう。')
  }

  if (improvementPoints.length === 0) {
    improvementPoints.push('特に大きな問題はありません。この調子を続けましょう。')
  }

  return { score, goodPoints, improvementPoints }
}
