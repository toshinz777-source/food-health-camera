import { useEffect, useState } from 'react'
import './App.css'
import { deleteMeal, getAllMeals, saveMeal } from './db'
import type { Meal } from './types'
import { BottomNav, type View } from './components/BottomNav'
import { Home } from './pages/Home'
import { Capture } from './pages/Capture'
import { Calendar } from './pages/Calendar'
import { DayDetail } from './pages/DayDetail'
import { Week } from './pages/Week'

type Screen = View | 'capture' | 'day'

function App() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<View>('home')
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    getAllMeals()
      .then(setMeals)
      .finally(() => setLoaded(true))
  }, [])

  function goTab(view: View) {
    setTab(view)
    setScreen(view)
  }

  function openCapture() {
    setScreen('capture')
  }

  function openDay(date: string) {
    setSelectedDate(date)
    setScreen('day')
  }

  async function handleSaveMeal(meal: Meal) {
    await saveMeal(meal)
    setMeals((prev) => [...prev, meal])
    goTab('home')
  }

  async function handleDeleteMeal(id: string) {
    await deleteMeal(id)
    setMeals((prev) => prev.filter((m) => m.id !== id))
  }

  if (!loaded) {
    return <div className="app-loading">読み込み中…</div>
  }

  return (
    <div className="app">
      <div className="app__content">
        {screen === 'home' && (
          <Home meals={meals} onOpenCapture={openCapture} onDeleteMeal={handleDeleteMeal} />
        )}
        {screen === 'calendar' && <Calendar meals={meals} onSelectDate={openDay} />}
        {screen === 'week' && <Week meals={meals} onSelectDate={openDay} />}
        {screen === 'capture' && <Capture onSave={handleSaveMeal} onCancel={() => goTab('home')} />}
        {screen === 'day' && selectedDate && (
          <DayDetail
            date={selectedDate}
            meals={meals}
            onBack={() => goTab('calendar')}
            onDeleteMeal={handleDeleteMeal}
          />
        )}
      </div>

      {(screen === 'home' || screen === 'calendar' || screen === 'week') && (
        <BottomNav current={tab} onChange={goTab} />
      )}
    </div>
  )
}

export default App
