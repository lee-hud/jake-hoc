import { BookmarkCheck, RotateCcw } from 'lucide-react'
import { AudioButton } from './AudioButton'
import type { VocabItem, WordProgress } from '../types'

interface WordRowProps {
  item: VocabItem
  state?: WordProgress
  onMark?: (id: string, status: 'learned' | 'review') => void
}

export function WordRow({ item, state, onMark }: WordRowProps) {
  return (
    <article className="word-row">
      <div className="word-row-main">
        <span className="hanzi word-row-hanzi">{item.word}</span>
        <span className="pinyin">{item.pinyin}</span>
        <span className="word-level">HSK {item.level}</span>
      </div>
      <div className="word-row-meaning">
        <span>{item.meaning}</span>
        {item.partOfSpeech && <span className="word-pos">{item.partOfSpeech}</span>}
      </div>
      <div className="word-row-actions">
        <AudioButton item={item} compact />
        {onMark && <>
          <button className={`icon-action ${state?.status === 'learned' ? 'marked' : ''}`} onClick={() => onMark(item.id, 'learned')} aria-label="Đánh dấu đã nhớ" title="Đã nhớ"><BookmarkCheck size={17} /></button>
          <button className={`icon-action ${state?.status === 'review' ? 'marked-review' : ''}`} onClick={() => onMark(item.id, 'review')} aria-label="Đưa vào ôn tập" title="Ôn lại"><RotateCcw size={16} /></button>
        </>}
      </div>
    </article>
  )
}
