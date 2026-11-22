import { ArrowLeft, ArrowRight, Check, Mic, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AudioButton } from '../components/AudioButton'
import { PronunciationCard } from '../components/PronunciationCard'
import { LevelSelect } from '../components/LevelSelect'
import type { ProgressMap, StudyMode, VocabItem } from '../types'

export interface StudySession { items: VocabItem[]; mode: StudyMode; reviewOnly: boolean }

interface StudyPageProps {
  session: StudySession | null
  level: number
  onLevelChange: (level: number) => void
  progress: ProgressMap
  reviewCount: number
  audioSizes: Record<string, { downloadMB: number }>
  onStart: (mode: StudyMode, reviewOnly: boolean) => void
  onRemember: (id: string, status: 'learned' | 'review') => void
  onAnswer: (id: string, isCorrect: boolean) => void
  onFinish: () => void
  onGoHome: () => void
}

export function StudyPage({ session, level, onLevelChange, progress, reviewCount, audioSizes, onStart, onRemember, onAnswer, onFinish, onGoHome }: StudyPageProps) {
  const [modeChoice, setModeChoice] = useState<StudyMode>('flash')
  const [reviewOnly, setReviewOnly] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hint, setHint] = useState(false)
  const [position, setPosition] = useState(0)

  useEffect(() => {
    setPosition(0)
    setFlipped(false)
    setAnswer('')
    setFeedback(null)
    setHint(false)
  }, [session?.items])

  if (!session) {
    return <div className="page page-inner">
      <button className="back-link" onClick={onGoHome}><ArrowLeft size={16} /> Hôm nay</button>
      <div className="page-title-block"><span className="eyebrow">PHIÊN HỌC MỚI</span><h1>Chọn cách ghi nhớ.</h1><p>Chia nhỏ một chặng dài thành vài từ vừa sức.</p></div>
      <section className="section-card study-launch-card">
        <div className="field-row"><div><span className="field-label">CẤP ĐỘ</span><p className="field-help">Chọn danh sách muốn luyện</p></div><LevelSelect value={level} onChange={onLevelChange} /></div>
        <div className="mode-choice-row">
          <button className={`mode-choice ${modeChoice === 'flash' ? 'selected' : ''}`} onClick={() => setModeChoice('flash')}><span className="mode-choice-icon">文</span><b>Thẻ từ</b><small>Lật để tự nhớ nghĩa</small></button>
          <button className={`mode-choice ${modeChoice === 'typing' ? 'selected' : ''}`} onClick={() => setModeChoice('typing')}><span className="mode-choice-icon">⌨</span><b>Luyện gõ</b><small>Gợi nghĩa, gõ chữ Hán</small></button>
          <button className={`mode-choice ${modeChoice === 'pronunciation' ? 'selected' : ''}`} onClick={() => setModeChoice('pronunciation')}><span className="mode-choice-icon"><Mic size={18} /></span><b>Luyện phát âm</b><small>Nghe mẫu rồi đọc to</small></button>
        </div>
        <label className="check-row"><input type="checkbox" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} /><span className="check-copy"><b>Chỉ học từ cần ôn</b><small>{reviewCount} mục đang được đánh dấu cần ôn</small></span><RotateCcw size={17} /></label>
        <button className="button button-primary button-wide" onClick={() => { setPosition(0); setFlipped(false); setAnswer(''); setFeedback(null); onStart(modeChoice, reviewOnly) }}>Bắt đầu phiên 12 từ <ArrowRight size={17} /></button>
      </section>
      <p className="source-note"><span className="note-mark">i</span> Khi luyện gõ trên điện thoại, chuyển bàn phím sang tiếng Trung/Pinyin rồi chọn đúng chữ Hán.</p>
    </div>
  }

  if (session.items.length === 0) return <div className="page page-inner"><section className="empty-state"><span className="empty-illustration">复</span><h2>Chưa có từ cần ôn.</h2><p>Hãy đánh dấu một vài từ “Cần ôn lại” hoặc đổi cấp HSK.</p><button className="button button-secondary" onClick={onGoHome}>Về trang chính</button></section></div>

  const item = session.items[position]
  if (!item) return <div className="page page-inner"><section className="completion-card"><span className="completion-seal"><Check size={30} /></span><span className="eyebrow">PHIÊN HỌC HOÀN TẤT</span><h1>Đi thêm một bước.</h1><p>Bạn vừa đi qua {session.items.length} từ. Tiến độ đã lưu trên thiết bị này.</p><button className="button button-primary" onClick={onFinish}>Về trang chính <ArrowRight size={17} /></button></section></div>

  const progressRatio = ((position + 1) / session.items.length) * 100
  const next = () => {
    setPosition((current) => current + 1)
    setFlipped(false); setAnswer(''); setFeedback(null); setHint(false)
  }
  const submit = () => {
    if (!answer.trim() || feedback === 'correct') return
    const isCorrect = answer.normalize('NFC').trim().replace(/\s+/g, '') === item.word.normalize('NFC').replace(/\s+/g, '')
    onAnswer(item.id, isCorrect)
    setFeedback(isCorrect ? 'correct' : 'wrong')
  }
  const retry = () => { setAnswer(''); setFeedback(null) }
  const audioMeta = audioSizes[String(item.level)]

  return <div className="page page-inner">
    <div className="study-topline"><button className="back-link" onClick={onFinish}><ArrowLeft size={16} /> Thoát phiên</button><span className="session-count">{position + 1}<i>/</i>{session.items.length}</span></div>
    <div className="session-progress"><span style={{ width: `${progressRatio}%` }} /></div>
    <div className="study-mode-tag"><span>{session.mode === 'flash' ? 'THẺ TỪ' : session.mode === 'typing' ? 'LUYỆN GÕ' : 'LUYỆN PHÁT ÂM'}</span><span>HSK {item.level}</span>{session.reviewOnly && <span className="review-chip">ÔN TẬP</span>}{progress[item.id] && <span>{progress[item.id].status === 'learned' ? 'ĐÃ NHỚ' : 'CẦN ÔN'}</span>}</div>

    {session.mode === 'flash' ? <section className={`flashcard ${flipped ? 'flashcard-flipped' : ''}`}>
      <div className="flashcard-index">TỪ {String(position + 1).padStart(2, '0')}</div>
      <div className="flashcard-content">
        {flipped ? <>
          <div className="flashcard-pinyin">{item.pinyin}</div>
          <div className="flashcard-meaning">{item.meaning}</div>
          {item.partOfSpeech && <span className="word-pos flashcard-pos">{item.partOfSpeech}</span>}
          <div className="flashcard-gloss">{item.gloss}</div>
        </> : <>
          <div className="flashcard-word hanzi">{item.word}</div>
          <div className="flashcard-hint">Chạm để xem nghĩa</div>
          <div className="flashcard-level">HSK {item.level} · {item.partOfSpeech || 'Từ vựng'}</div>
        </>}
      </div>
      <div className="flashcard-controls"><AudioButton item={item} downloadMB={audioMeta?.downloadMB} /><button className="flip-button" onClick={() => setFlipped((value) => !value)}>{flipped ? 'Xem mặt chữ' : 'Lật thẻ'} <RotateCcw size={15} /></button></div>
    </section> : session.mode === 'typing' ? <section className="typing-card">
      <span className="eyebrow">GÕ CHỮ HÁN TƯƠNG ỨNG</span>
      <div className="typing-prompt">{item.meaning}</div>
      <div className="typing-hint-row"><span>HSK {item.level} · {item.partOfSpeech}</span><button className="hint-button" onClick={() => setHint((value) => !value)}>{hint ? item.pinyin : 'Hiện pinyin'}</button></div>
      <AudioButton item={item} downloadMB={audioMeta?.downloadMB} />
      <form className="typing-form" onSubmit={(event) => { event.preventDefault(); submit() }}>
        <input autoComplete="off" autoCorrect="off" spellCheck={false} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Gõ chữ Hán bằng bàn phím Pinyin…" aria-label="Câu trả lời chữ Hán" disabled={feedback === 'correct'} />
        {feedback === 'correct' ? <div className="answer-feedback feedback-correct"><Check size={18} /><span><b>Chính xác!</b> {item.word} · {item.pinyin}</span></div> : feedback === 'wrong' ? <div className="answer-feedback feedback-wrong"><span><b>Chưa đúng.</b> Đáp án là <strong className="hanzi">{item.word}</strong> · {item.pinyin}</span></div> : null}
        {feedback === 'wrong' ? <div className="typing-actions"><button type="button" className="button button-secondary" onClick={retry}>Thử lại</button><button type="button" className="text-button" onClick={next}>Bỏ qua <ArrowRight size={15} /></button></div> : feedback === 'correct' ? <button type="button" className="button button-primary button-wide" onClick={next}>Từ tiếp theo <ArrowRight size={16} /></button> : <button className="button button-primary button-wide" type="submit" disabled={!answer.trim()}>Kiểm tra <Check size={17} /></button>}
      </form>
    </section> : <PronunciationCard key={item.id} item={item} downloadMB={audioMeta?.downloadMB} onAnswer={onAnswer} onNext={next} />}

    {session.mode === 'flash' && flipped && <div className="memory-actions"><p>Bạn đã nhớ được từ này chưa?</p><div><button className="button button-secondary" onClick={() => { onRemember(item.id, 'review'); next() }}><RotateCcw size={16} /> Cần ôn lại</button><button className="button button-primary" onClick={() => { onRemember(item.id, 'learned'); next() }}><Check size={16} /> Đã nhớ</button></div></div>}
    <p className="study-footnote">{session.mode === 'typing' ? 'Đáp án cần là chữ Hán giản thể; pinyin là cách nhập, không phải đáp án.' : session.mode === 'pronunciation' ? 'Kết quả nhận diện giúp đối chiếu chữ; ứng dụng không chấm chính xác thanh điệu.' : 'Bạn có thể nghe phát âm trước khi tự đánh giá mức độ ghi nhớ.'}</p>
  </div>
}
