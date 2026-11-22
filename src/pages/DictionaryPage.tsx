import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TranslationPanel } from '../components/TranslationPanel'
import { WordRow } from '../components/WordRow'
import { matchesDictionaryPhrase, normalizeSearch } from '../lib/study'
import type { ProgressMap, VocabItem } from '../types'

interface DictionaryPageProps {
  items: VocabItem[]
  progress: ProgressMap
  onMark: (id: string, status: 'learned' | 'review') => void
}

export function DictionaryPage({ items, progress, onMark }: DictionaryPageProps) {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 30
  const filtered = useMemo(() => {
    const q = normalizeSearch(query)
    return items.filter((item) => {
      if (level && item.level !== level) return false
      if (status === 'new' && progress[item.id]) return false
      if (status === 'learned' && progress[item.id]?.status !== 'learned') return false
      if (status === 'review' && progress[item.id]?.status !== 'review') return false
      if (!q) return true
      const searchable = normalizeSearch(`${item.word} ${item.pinyin} ${item.meaning} ${item.partOfSpeech} ${item.gloss}`)
      return searchable.includes(q) || matchesDictionaryPhrase(item, query)
    })
  }, [items, level, progress, query, status])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const isSentence = query.trim().length > 10 || /[。！？!?；;]/u.test(query) || query.trim().split(/\s+/u).length > 4

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  return <div className="page page-inner dictionary-page">
    <div className="page-title-block compact-title"><span className="eyebrow">TỪ ĐIỂN CÁ NHÂN</span><h1>Từ hay cả câu đều tra được.</h1><p>Tìm trong 5.000 mục HSK bằng chữ Hán, pinyin, nghĩa tiếng Việt/Anh; dán nguyên câu để xem các từ HSK có trong câu.</p></div>
    <div className="dictionary-search"><Search size={19} /><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Ví dụ: 你好, nihao, xin chào hoặc cả câu…" aria-label="Tìm từ hoặc câu bằng chữ Hán, pinyin hoặc nghĩa" />{query && <button onClick={() => updateQuery('')} aria-label="Xóa tìm kiếm"><X size={17} /></button>}</div>
    <p className="dictionary-sentence-hint">Câu dài được dò theo từng mục từ trong bộ HSK; có thể dùng công cụ bên dưới để thử luồng dịch.</p>
    <TranslationPanel dictionaryQuery={query} onSearchQuery={updateQuery} />
    {isSentence && <p className="dictionary-match-summary" role="status">Tìm thấy {filtered.length.toLocaleString('vi-VN')} mục HSK khớp với từ/cụm trong câu.</p>}
    <div className="dictionary-filters"><span className="filter-label"><SlidersHorizontal size={15} /> Lọc</span><div className="filter-levels"><button className={level === 0 ? 'filter-chip selected' : 'filter-chip'} onClick={() => { setLevel(0); setPage(1) }}>Tất cả</button>{[1, 2, 3, 4, 5, 6].map((n) => <button key={n} className={level === n ? 'filter-chip selected' : 'filter-chip'} onClick={() => { setLevel(n); setPage(1) }}>HSK {n}</button>)}</div></div>
    <div className="dictionary-subfilters"><label className="sr-only" htmlFor="status-filter">Lọc trạng thái học</label><select id="status-filter" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="all">Mọi trạng thái</option><option value="new">Chưa học</option><option value="learned">Đã nhớ</option><option value="review">Cần ôn</option></select><span>{filtered.length.toLocaleString('vi-VN')} mục</span></div>
    <div className="dictionary-list">
      {visible.map((item) => <WordRow key={item.id} item={item} state={progress[item.id]} onMark={onMark} />)}
      {visible.length === 0 && <div className="empty-state empty-search"><span className="empty-illustration">找</span><h2>Chưa tìm thấy từ.</h2><p>Thử chữ Hán, pinyin không dấu, nghĩa tiếng Việt hoặc dán cả câu để tìm các mục HSK bên trong.</p></div>}
    </div>
    {filtered.length > pageSize && <div className="pagination"><button className="button button-secondary" disabled={page === 1} onClick={() => { setPage((value) => value - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Trước</button><span>Trang {page} / {pageCount}</span><button className="button button-secondary" disabled={page >= pageCount} onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Sau</button></div>}
  </div>
}
