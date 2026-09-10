export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
}

export interface MealTags {
  vegetables: boolean
  fruit: boolean
  protein: boolean
  carbs: boolean
  fat: boolean
  sweets: boolean
  saltyHigh: boolean
  processedHigh: boolean
}

export interface Meal extends MealTags {
  id: string
  date: string // YYYY-MM-DD (local)
  mealType: MealType
  name: string
  photo: string // data URL
  score: number
  createdAt: number
}

export type NewMeal = Omit<Meal, 'id' | 'createdAt' | 'score'>

export function emptyTags(): MealTags {
  return {
    vegetables: false,
    fruit: false,
    protein: false,
    carbs: false,
    fat: false,
    sweets: false,
    saltyHigh: false,
    processedHigh: false,
  }
}

export const TAG_OPTIONS: { key: keyof MealTags; label: string; kind: 'positive' | 'warning' }[] = [
  { key: 'vegetables', label: '野菜', kind: 'positive' },
  { key: 'fruit', label: '果物', kind: 'positive' },
  { key: 'protein', label: 'タンパク質', kind: 'positive' },
  { key: 'carbs', label: '炭水化物', kind: 'positive' },
  { key: 'fat', label: '脂質', kind: 'positive' },
  { key: 'sweets', label: '甘い物', kind: 'warning' },
  { key: 'saltyHigh', label: '塩分が多そう', kind: 'warning' },
  { key: 'processedHigh', label: '加工食品が多そう', kind: 'warning' },
]

export function hasAnyTag(tags: MealTags): boolean {
  return TAG_OPTIONS.some((opt) => tags[opt.key])
}
