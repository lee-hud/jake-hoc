import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LevelSelect } from '../components/LevelSelect'
import type { QuizQuestion } from '../lib/study'

interface QuizPageProps {
  level: number
  onLevelChange: (level: number) => void
  reviewCount: number
  questions: QuizQuestion[] | null
  onStart: (reviewOnly: boolean) => void
  onAnswer: (id: string, isCorrect: boolean) => void
  onExit: () => void
}

export function QuizPage({ level, onLevelChange, reviewCount, questions, onStart, onAnswer, onExit }: QuizPageProps) {
  const [reviewOnly, setReviewOnly] = useState(false)
  const [position, setPosition] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    setPosition(0)
    setSelected(null)
    setScore(0)
  }, [questions])

  if (!questions) return <div className="page page-inner">
    <button className="back-link" onClick={onExit}><ArrowLeft size={16} /> Hôm nay</button>
    <div className="page-title-block"><span className="eyebrow">KIỂM TRA NHẸ NHÀNG</span><h1>Ôn bằng một câu hỏi.</h1><p>Chọn nghĩa hoặc chữ Hán. Mỗi lượt có tối đa 10 câu.</p></div>
    <section className="section-card study-launch-card quiz-launch-card">
      <div className="field-row"><div><span className="field-label">CẤP ĐỘ</span><p className="field-help">Câu hỏi lấy từ cấp này</p></div><LevelSelect value={level} onChange={onLevelChange} /></div>
      <label className="check-row"><input type="checkbox" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} /><span className="check-copy"><b>Chỉ hỏi từ cần ôn</b><small>{reviewCount} từ đang ở danh sách ôn tập</small></span><RotateCcw size={17} /></label>
      <div className="quiz-deck-preview"><span className="quiz-sparkle"><Sparkles size={18} /></span><div><b>10 câu · HSK {level}</b><small>Đáp án và pinyin hiện ngay sau mỗi lượt</small></div></div>
      <button className="button button-primary button-wide" onClick={() => { setPosition(0); setSelected(null); setScore(0); onStart(reviewOnly) }}>Bắt đầu quiz <ArrowRight size={17} /></button>
    </section>
  </div>

  if (questions.length === 0) return <div className="page page-inner"><section className="empty-state"><span className="empty-illustration">空</span><h2>Chưa có từ trong lượt này.</h2><p>Đổi cấp HSK hoặc tắt chế độ chỉ ôn từ cần nhớ.</p><button className="button button-secondary" onClick={onExit}>Về trang chính</button></section></div>

  const complete = position >= questions.length
  if (complete) return <div className="page page-inner"><section className="completion-card quiz-completion"><span className="completion-seal"><Sparkles size={28} /></span><span className="eyebrow">QUIZ HOÀN TẤT</span><h1>{score} / {questions.length}</h1><p>{score === questions.length ? 'Tuyệt vời — bạn đã nắm chắc lượt này.' : 'Mỗi lần thử là một lần nhớ thêm.'}</p><div className="quiz-result-bar"><span style={{ width: `${Math.round((score / questions.length) * 100)}%` }} /></div><button className="button button-primary" onClick={onExit}>Về trang chính <ArrowRight size={17} /></button></section></div>

  const question = questions[position]
  function choose(option: string) {
    if (selected) return
    const right = option === question.answer
    setSelected(option)
    if (right) setScore((value) => value + 1)
    onAnswer(question.id, right)
  }
  function next() { setSelected(null); setPosition((value) => value + 1) }

  return <div className="page page-inner quiz-page">
    <div className="study-topline"><button className="back-link" onClick={onExit}><ArrowLeft size={16} /> Thoát quiz</button><span className="session-count">{position + 1}<i>/</i>{questions.length}</span></div>
    <div className="session-progress"><span style={{ width: `${((position + 1) / questions.length) * 100}%` }} /></div>
    <div className="study-mode-tag"><span>QUIZ NHANH</span><span>HSK {level}</span></div>
    <section className="quiz-question-card">
      <span className="eyebrow">{question.promptKind === 'meaning' ? 'CHỌN CHỮ HÁN' : 'CHỌN NGHĨA TIẾNG VIỆT'}</span>
      <div className={`quiz-prompt ${question.promptKind === 'meaning' ? '' : 'hanzi'}`}>{question.prompt}</div>
      {selected && <div className={`quiz-pinyin ${selected === question.answer ? 'right-text' : 'wrong-text'}`}>{selected === question.answer ? <Check size={16} /> : <X size={16} />} Đáp án: {question.answer} · {question.pinyin}</div>}
    </section>
    <div className="quiz-options">
      {question.options.map((option, index) => {
        const isCorrect = option === question.answer
        const isSelected = selected === option
        return <button key={`${question.id}-${index}`} className={`quiz-option ${selected && isCorrect ? 'option-correct' : ''} ${isSelected && !isCorrect ? 'option-wrong' : ''} ${question.promptKind === 'meaning' ? 'hanzi' : ''}`} onClick={() => choose(option)} disabled={Boolean(selected)}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}{selected && isCorrect && <Check size={17} className="option-mark" />}{isSelected && !isCorrect && <X size={17} className="option-mark" />}</button>
      })}
    </div>
    {selected && <button className="button button-primary button-wide quiz-next" onClick={next}>Câu tiếp theo <ArrowRight size={17} /></button>}
    <p className="study-footnote">{score} câu đúng · tiến độ lưu trên thiết bị</p>
  </div>
}
