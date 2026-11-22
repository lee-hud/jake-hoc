import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, X } from 'lucide-react'
import { BottomNav } from './components/BottomNav'
import { Header } from './components/Header'
import { DictionaryPage } from './pages/DictionaryPage'
import { HomePage } from './pages/HomePage'
import { ProgressPage } from './pages/ProgressPage'
import { QuizPage } from './pages/QuizPage'
import { StudyPage, type StudySession } from './pages/StudyPage'
import { readProgress, recordAttempt, saveProgress, setKnowledge, summarizeProgress } from './lib/progress'
import { makeDeck, makeQuiz, type QuizQuestion } from './lib/study'
import type { AudioPackInfo, ProgressMap, StudyMode, TabId, VocabItem } from './types'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const levelStorageKey = 'hanzi-hoc-level-v1'

function readSavedLevel(): number {
  try {
    const level = Number(localStorage.getItem(levelStorageKey))
    return level >= 1 && level <= 6 ? level : 1
  } catch {
    return 1
  }
}

function InstallHelp({ onClose }: { onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onClick={onClose}>
    <section className="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
      <span className="install-modal-icon">汉</span><span className="eyebrow">HỌC TRÊN MÀN HÌNH CHÍNH</span>
      <h2 id="install-title">Mang Jake Học theo bạn.</h2>
      <p>Trong trình duyệt Android, mở menu <b>⋮</b> rồi chọn <b>“Cài đặt ứng dụng”</b> hoặc <b>“Thêm vào màn hình chính”</b>.</p>
      <div className="install-modal-note"><Check size={16} /> Có thể mở như ứng dụng; tiến độ vẫn lưu trên thiết bị này.</div>
      <button className="button button-primary button-wide" onClick={onClose}>Đã hiểu</button>
    </section>
  </div>
}

function App() {
  const [items, setItems] = useState<VocabItem[]>([])
  const [audioSizes, setAudioSizes] = useState<Record<string, AudioPackInfo>>({})
  const [progress, setProgress] = useState<ProgressMap>({})
  const [level, setLevel] = useState(readSavedLevel)
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    setProgress(readProgress())
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [vocabResponse, audioResponse] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}data/vocab.json`),
        fetch(`${import.meta.env.BASE_URL}data/audio-sizes.json`),
      ])
      if (!vocabResponse.ok || !audioResponse.ok) throw new Error('Không tải được bộ dữ liệu HSK.')
      const [vocab, sizes] = await Promise.all([vocabResponse.json(), audioResponse.json()]) as [VocabItem[], Record<string, AudioPackInfo>]
      if (vocab.length !== 5000) throw new Error(`Bộ dữ liệu hiện có ${vocab.length} mục, chưa đủ 5.000 từ.`)
      setItems(vocab)
      setAudioSizes(sizes)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Có lỗi khi nạp dữ liệu. Hãy thử tải lại trang.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])
  useEffect(() => {
    try { localStorage.setItem(levelStorageKey, String(level)) } catch { /* Browser storage may be disabled. */ }
  }, [level])

  const updateProgress = useCallback((next: ProgressMap) => {
    setProgress(next)
    saveProgress(next)
  }, [])

  const markWord = useCallback((id: string, status: 'learned' | 'review') => {
    setProgress((current) => {
      const next = setKnowledge(current, id, status)
      saveProgress(next)
      return next
    })
  }, [])

  const answerWord = useCallback((id: string, correct: boolean) => {
    setProgress((current) => {
      const next = recordAttempt(current, id, correct)
      saveProgress(next)
      return next
    })
  }, [])

  const startStudy = useCallback((mode: StudyMode, reviewOnly = false) => {
    const deck = makeDeck(items, progress, level, reviewOnly, 12)
    setStudySession({ items: deck, mode, reviewOnly })
    setActiveTab('study')
  }, [items, level, progress])

  const startQuiz = useCallback((reviewOnly = false) => {
    setQuizQuestions(makeQuiz(items, progress, level, reviewOnly, 10))
    setActiveTab('quiz')
  }, [items, level, progress])

  async function handleInstall() {
    if (!installPrompt) { setShowInstallHelp(true); return }
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  function finishStudy() {
    setStudySession(null)
    setActiveTab('home')
  }

  function resetProgress() {
    updateProgress({})
  }

  const progressStats = useMemo(() => summarizeProgress(progress), [progress])
  const reviewCount = progressStats.review

  return <div className="app-shell">
    <Header onInstall={() => { void handleInstall() }} canInstall={Boolean(installPrompt)} />
    <main className="app-main">
      {loading ? <div className="loading-state"><div className="loading-seal">学</div><span className="eyebrow">ĐANG MỞ SỔ TỪ</span><p>Đang chuẩn bị 5.000 mục HSK…</p><div className="loading-track"><span /></div></div> : loadError ? <div className="load-error"><AlertCircle size={22} /><h2>Chưa mở được bộ từ.</h2><p>{loadError}</p><button className="button button-primary" onClick={() => { void loadData() }}>Thử lại</button></div> : <>
        <div hidden={activeTab !== 'home'}><HomePage items={items} progress={progress} level={level} onLevelChange={setLevel} onStudy={startStudy} onQuiz={startQuiz} onDictionary={() => setActiveTab('dictionary')} /></div>
        <div hidden={activeTab !== 'study'}><StudyPage session={studySession} level={level} onLevelChange={setLevel} progress={progress} reviewCount={reviewCount} audioSizes={audioSizes} onStart={startStudy} onRemember={markWord} onAnswer={answerWord} onFinish={finishStudy} onGoHome={() => setActiveTab('home')} /></div>
        <div hidden={activeTab !== 'quiz'}><QuizPage level={level} onLevelChange={setLevel} reviewCount={reviewCount} questions={quizQuestions} onStart={(reviewOnly) => setQuizQuestions(makeQuiz(items, progress, level, reviewOnly, 10))} onAnswer={answerWord} onExit={() => { setQuizQuestions(null); setActiveTab('home') }} /></div>
        <div hidden={activeTab !== 'dictionary'}><DictionaryPage items={items} progress={progress} onMark={markWord} /></div>
        <div hidden={activeTab !== 'progress'}><ProgressPage items={items} progress={progress} onReset={resetProgress} /></div>
        {activeTab === 'home' && !online && <div className="offline-banner"><span className="offline-dot" /> Bạn đang ngoại tuyến · dữ liệu đã mở vẫn dùng được</div>}
      </>}
    </main>
    {!loading && !loadError && <BottomNav active={activeTab} onChange={setActiveTab} />}
    {showInstallHelp && <InstallHelp onClose={() => setShowInstallHelp(false)} />}
    <div aria-live="polite" className="sr-only">{progressStats.learned} từ đã nhớ, {progressStats.review} từ cần ôn</div>
  </div>
}

export default App
