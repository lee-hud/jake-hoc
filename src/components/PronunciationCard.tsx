import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Mic, RotateCcw, Square } from 'lucide-react'
import { AudioButton } from './AudioButton'
import { createMandarinSpeechRecognition, supportsMandarinSpeechRecognition, type SpeechRecognitionInstanceLike } from '../lib/speech-recognition'
import type { VocabItem } from '../types'

interface PronunciationCardProps {
  item: VocabItem
  downloadMB?: number
  onAnswer: (id: string, isCorrect: boolean) => void
  onNext: () => void
}

type Feedback = 'matched' | 'unmatched' | 'self-ready' | 'self-practice' | null

function normalizeSpeech(text: string) {
  return text.normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu, '')
}

function recognitionErrorMessage(error: string) {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'Micro chưa được cấp quyền. Hãy cho phép sử dụng micro trong trình duyệt rồi thử lại.'
  if (error === 'no-speech') return 'Chưa nghe thấy tiếng. Hãy đưa micro gần hơn và đọc lại từ.'
  if (error === 'network') return 'Nhận diện giọng nói cần kết nối mạng. Hãy kiểm tra mạng rồi thử lại.'
  if (error === 'audio-capture') return 'Không tìm thấy micro. Hãy kiểm tra micro của thiết bị.'
  if (error === 'aborted') return ''
  return 'Không thể nhận diện lần này. Hãy thử lại hoặc tự luyện với âm mẫu.'
}

export function PronunciationCard({ item, downloadMB, onAnswer, onNext }: PronunciationCardProps) {
  const [supported, setSupported] = useState(supportsMandarinSpeechRecognition)
  const [listening, setListening] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null)

  useEffect(() => () => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
  }, [])

  function startListening() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = createMandarinSpeechRecognition()
    if (!recognition) {
      setSupported(false)
      return
    }

    setSupported(true)
    setError('')
    setTranscript('')
    setLiveTranscript('')
    setFeedback(null)
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    setListening(true)

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const spoken = result[0]?.transcript?.trim() ?? ''
        if (result.isFinal) finalTranscript = spoken
        else interim = spoken
      }
      if (interim) setLiveTranscript(interim)
      if (!finalTranscript) return

      const matched = normalizeSpeech(finalTranscript) === normalizeSpeech(item.word)
      setTranscript(finalTranscript)
      setLiveTranscript('')
      setFeedback(matched ? 'matched' : 'unmatched')
      onAnswer(item.id, matched)
    }
    recognition.onerror = (event) => {
      const message = recognitionErrorMessage(event.error)
      if (message) setError(message)
      setListening(false)
    }
    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch {
      setListening(false)
      setError('Chưa thể mở micro. Hãy thử lại sau giây lát.')
      recognitionRef.current = null
    }
  }

  function selfAssess(correct: boolean) {
    setFeedback(correct ? 'self-ready' : 'self-practice')
    onAnswer(item.id, correct)
  }

  return <section className="pronunciation-card" aria-labelledby="pronunciation-word">
    <span className="eyebrow">NGHE MẪU · ĐỌC THÀNH TIẾNG</span>
    <div id="pronunciation-word" className="pronunciation-word hanzi">{item.word}</div>
    <div className="pronunciation-pinyin">{item.pinyin}<span> · HSK {item.level}</span></div>
    <p className="pronunciation-meaning">{item.meaning}</p>
    {supported && <p className="speech-permission-note">Nhấn “Nói vào micro”; trình duyệt sẽ hỏi quyền sử dụng micro lần đầu.</p>}

    <div className="pronunciation-reference">
      <AudioButton item={item} downloadMB={downloadMB} />
    </div>

    {supported ? <>
      <button className={`button ${listening ? 'button-secondary' : 'button-primary'} button-wide pronunciation-record`} onClick={startListening}>
        {listening ? <><Square size={16} /> Dừng nghe</> : <><Mic size={17} /> Nói vào micro</>}
      </button>
      <p className={`speech-live ${listening ? 'is-listening' : ''}`} aria-live="polite">
        {listening ? (liveTranscript ? `Đang nghe: ${liveTranscript}` : 'Đang nghe… hãy đọc từ tiếng Trung.') : ''}
      </p>
      {transcript && <div className={`answer-feedback ${feedback === 'matched' ? 'feedback-correct' : 'feedback-wrong'}`} role="status">
        {feedback === 'matched' ? <Check size={18} /> : <RotateCcw size={17} />}
        <span>{feedback === 'matched' ? <><b>Nhận diện khớp.</b> Mình nghe được “{transcript}”.</> : <><b>Nhận diện chưa khớp.</b> Mình nghe được “{transcript}”. Từ cần đọc là <strong className="hanzi">{item.word}</strong> · {item.pinyin}.</>}</span>
      </div>}
      {error && <p className="speech-error" role="alert">{error}</p>}
      {feedback === 'matched' ? <button className="button button-primary button-wide pronunciation-next" onClick={onNext}>Từ tiếp theo <ArrowRight size={16} /></button> : feedback === 'unmatched' ? <div className="pronunciation-actions"><button className="button button-secondary" onClick={startListening}><RotateCcw size={15} /> Thử lại</button><button className="text-button" onClick={onNext}>Bỏ qua <ArrowRight size={15} /></button></div> : null}
    </> : <>
      <div className="speech-unsupported" role="status">Trình duyệt này chưa hỗ trợ nhận diện giọng nói tiếng Trung. Bạn vẫn có thể nghe âm mẫu và tự luyện.</div>
      {feedback === null ? <div className="pronunciation-fallback-actions"><button className="button button-primary button-wide" onClick={() => selfAssess(true)}><Check size={16} /> Tôi đọc ổn</button><button className="button button-secondary button-wide" onClick={() => selfAssess(false)}><RotateCcw size={15} /> Cần luyện thêm</button></div> : <><div className={`answer-feedback ${feedback === 'self-ready' ? 'feedback-correct' : 'feedback-wrong'}`} role="status">{feedback === 'self-ready' ? <><Check size={17} /><span><b>Đã ghi nhận.</b> Tiếp tục luyện đều nhé.</span></> : <><RotateCcw size={17} /><span><b>Đã ghi nhận.</b> Hãy nghe lại âm mẫu và luyện thêm.</span></>}</div><button className="button button-primary button-wide pronunciation-next" onClick={onNext}>Từ tiếp theo <ArrowRight size={16} /></button></>}
    </>}

    <p className="speech-privacy-note">Nhận diện có thể cần mạng và được xử lý bởi dịch vụ giọng nói của trình duyệt. Ứng dụng không lưu bản ghi; kết quả so khớp chữ, chưa chấm chính xác thanh điệu.</p>
  </section>
}
