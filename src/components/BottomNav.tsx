import './BottomNav.css'

export type View = 'home' | 'calendar' | 'week'

const ITEMS: { view: View; label: string; icon: string }[] = [
  { view: 'home', label: 'ホーム', icon: '🏠' },
  { view: 'calendar', label: 'カレンダー', icon: '📅' },
  { view: 'week', label: '週間', icon: '📊' },
]

export function BottomNav({ current, onChange }: { current: View; onChange: (v: View) => void }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.view}
          className={`bottom-nav__item ${current === item.view ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onChange(item.view)}
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
