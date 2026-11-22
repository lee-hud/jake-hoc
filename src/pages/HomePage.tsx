import { ArrowRight, BookOpen, Check, ChevronRight, Mic, RotateCcw, Search, Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'
import { LevelSelect } from '../components/LevelSelect'
import { AudioButton } from '../components/AudioButton'
import type { ProgressMap, StudyMode, VocabItem } from '../types'

interface HomePageProps {
  items: VocabItem[]
  progress: ProgressMap
  level: number
  onLevelChange: (level: number) => void
  onStudy: (mode: StudyMode, reviewOnly?: boolean) => void
  onQuiz: (reviewOnly?: boolean) => void
  onDictionary: () => void
}

export function HomePage({ items, progress, level, onLevelChange, onStudy, onQuiz, onDictionary }: HomePageProps) {
  const levelItems = items.filter((item) => item.level === level)
  const learned = levelItems.filter((item) => progress[item.id]?.status === 'learned').length
  const due = levelItems.filter((item) => progress[item.id]?.status === 'review').length
  const completion = levelItems.length ? Math.round((learned / levelItems.length) * 100) : 0
  const today = new Date()
  const dayLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)
  const pickSeed = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86_400_000)
  const wordOfDay = items[pickSeed % Math.max(items.length, 1)]

  return (
    <div className="page page-home">
      <div className="greeting-row">
        <div>
          <div className="eyebrow">{dayLabel.charAt(0).toLocaleUpperCase('vi') + dayLabel.slice(1)}</div>
          <h1>Chào bạn học.</h1>
          <p className="muted">Một chút mỗi ngày, tiến xa hơn mỗi tuần.</p>
        </div>
        <div className="seal-mark" aria-hidden="true">学</div>
      </div>

      <section className="hero-panel">
        <div className="hero-topline"><span className="hero-kicker">BÀI HỌC CỦA BẠN</span><span className="hero-level">HSK {level}</span></div>
        <div className="hero-title-row">
          <div>
            <h2>Hôm nay,<br /><em>học thêm một chút.</em></h2>
            <p>{learned} / {levelItems.length} từ đã nhớ ở cấp này</p>
          </div>
          <div className="progress-ring" style={{ '--progress': `${completion}%` } as CSSProperties} aria-label={`Hoàn thành ${completion}%`}>
            <span>{completion}<small>%</small></span>
          </div>
        </div>
        <div className="hero-progress-track"><span style={{ width: `${completion}%` }} /></div>
        <div className="hero-actions">
          <button className="button button-paper" onClick={() => onStudy('flash')}><BookOpen size={17} /> Bắt đầu học <ArrowRight size={16} /></button>
          <button className="button button-ghost-light" onClick={() => onStudy('typing')}><span className="hanzi tiny-hanzi">字</span> Luyện gõ</button>
        </div>
        <div className="hero-stamp">慢慢来<br /><span>TỪ TỪ THÔI</span></div>
      </section>

      <div className="home-stats-row">
        <div className="mini-stat"><span className="mini-stat-icon stat-rose"><RotateCcw size={17} /></span><div><b>{due}</b><small>từ cần ôn</small></div></div>
        <div className="mini-stat"><span className="mini-stat-icon stat-green"><Check size={18} /></span><div><b>{learned}</b><small>đã ghi nhớ</small></div></div>
        <button className="mini-stat mini-stat-action" onClick={onDictionary}><span className="mini-stat-icon stat-ink"><Search size={17} /></span><div><b>5.000</b><small>tra từ điển</small></div><ChevronRight size={16} className="stat-chevron" /></button>
      </div>

      <div className="home-columns">
        <section className="section-card level-card">
          <div className="section-heading"><div><span className="eyebrow">CHỌN CHẶNG</span><h3>Hành trình HSK</h3></div><LevelSelect value={level} onChange={onLevelChange} /></div>
          <div className="level-ruler" aria-label="Chọn cấp HSK">
            {[1, 2, 3, 4, 5, 6].map((n) => {
              const total = items.filter((item) => item.level === n).length
              const done = items.filter((item) => item.level === n && progress[item.id]?.status === 'learned').length
              return <button key={n} onClick={() => onLevelChange(n)} className={`level-step ${level === n ? 'selected' : ''}`} aria-label={`Chọn HSK ${n}`}><span className="level-dot">{n}</span><span className="level-step-label">HSK {n}</span><span className="level-step-count">{done}/{total}</span><span className="level-step-line" /></button>
            })}
          </div>
          <div className="level-card-bottom"><span>Đang học <b>HSK {level}</b> · {levelItems.length.toLocaleString('vi-VN')} mục</span><button className="text-button" onClick={() => onStudy('flash')}>Vào bài học <ArrowRight size={15} /></button></div>
        </section>

        <section className="word-of-day-card">
          <div className="section-heading"><div><span className="eyebrow">MỖI NGÀY MỘT TỪ</span><h3>Từ hôm nay</h3></div><span className="red-seal-mini">日</span></div>
          {wordOfDay && <>
            <div className="word-of-day-hanzi hanzi">{wordOfDay.word}</div>
            <div className="word-of-day-pinyin">{wordOfDay.pinyin}<span> · HSK {wordOfDay.level}</span></div>
            <p className="word-of-day-meaning">{wordOfDay.meaning}</p>
            <AudioButton item={wordOfDay} downloadMB={0} />
          </>}
        </section>
      </div>

      <section className="section-card practice-card">
        <div className="section-heading"><div><span className="eyebrow">CHỌN CÁCH LUYỆN</span><h3>Điều gì hợp với bạn?</h3></div><Sparkles size={18} className="section-doodle" /></div>
        <div className="practice-options">
          <button className="practice-option" onClick={() => onStudy('flash')}><span className="practice-index">01</span><span className="practice-copy"><b>Thẻ từ</b><small>Nhìn, lật, tự kiểm tra trí nhớ</small></span><ArrowRight size={17} /></button>
          <button className="practice-option" onClick={() => onStudy('typing')}><span className="practice-index">02</span><span className="practice-copy"><b>Luyện gõ</b><small>Gợi nghĩa, gõ chữ Hán bằng Pinyin</small></span><ArrowRight size={17} /></button>
          <button className="practice-option" onClick={() => onQuiz()}><span className="practice-index">03</span><span className="practice-copy"><b>Quiz nhanh</b><small>10 câu trắc nghiệm theo cấp HSK</small></span><ArrowRight size={17} /></button>
          <button className="practice-option" onClick={() => onStudy('pronunciation')}><span className="practice-index">04</span><span className="practice-copy"><b>Luyện phát âm</b><small>Nghe mẫu, nói và đối chiếu chữ nhận diện</small></span><Mic size={17} /></button>
          {due > 0 && <button className="practice-option review-option" onClick={() => onQuiz(true)}><span className="practice-index">↻</span><span className="practice-copy"><b>Ôn {due} từ</b><small>Tập trung vào những mục đang cần nhớ</small></span><ArrowRight size={17} /></button>}
        </div>
      </section>

      <p className="source-note"><span className="note-mark">i</span> Danh sách HSK 2.0 sáu cấp. Nghĩa tiếng Việt có hỗ trợ dịch tự động; hãy đối chiếu từ điển khi cần độ chính xác chuyên sâu.</p>
    </div>
  )
}
