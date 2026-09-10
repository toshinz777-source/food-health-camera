const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function formatDateJa(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`)
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAY_LABELS[d.getDay()]})`
}

export function weekdayLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`)
  return WEEKDAY_LABELS[d.getDay()]
}

export function addDays(dateKey: string, delta: number): string {
  const d = new Date(`${dateKey}T00:00:00`)
  d.setDate(d.getDate() + delta)
  return toDateKey(d)
}

export function lastNDays(n: number, endKey: string = todayKey()): string[] {
  const result: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    result.push(addDays(endKey, -i))
  }
  return result
}

export function monthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()
  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toDateKey(new Date(year, month, day)))
  }
  return cells
}

export function monthLabel(year: number, month: number): string {
  return `${year}年${month + 1}月`
}

function guessMealTypeByHour(hour: number): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  if (hour < 10) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}

export function guessCurrentMealType(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  return guessMealTypeByHour(new Date().getHours())
}
