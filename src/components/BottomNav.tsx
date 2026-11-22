import { BookOpen, ChartNoAxesColumnIncreasing, House, LibraryBig, Sparkles } from 'lucide-react'
import type { TabId } from '../types'

const tabs: { id: TabId; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Hôm nay', icon: House },
  { id: 'study', label: 'Học từ', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: Sparkles },
  { id: 'dictionary', label: 'Tra từ', icon: LibraryBig },
  { id: 'progress', label: 'Tiến độ', icon: ChartNoAxesColumnIncreasing },
]

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} className={`nav-item ${active === id ? 'is-active' : ''}`} onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined}>
          <Icon size={20} strokeWidth={active === id ? 2.3 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
