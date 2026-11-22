import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeftRight, Languages, Mic, Search, Square, WandSparkles } from 'lucide-react'
import { createSpeechRecognition, supportsSpeechRecognition, type SpeechRecognitionErrorEventLike, type SpeechRecognitionInstanceLike, type SpeechRecognitionResultEventLike } from '../lib/speech-recognition'

type Direction = 'auto' | 'zh-vi' | 'vi-zh'
type Industry = 'technology' | 'trade' | 'manufacturing' | 'medicine' | 'law' | 'custom'

const industries: { value: Industry; label: string }[] = [
  { value: 'technology', label: 'Kỹ thuật / công nghệ' },
  { value: 'trade', label: 'Thương mại / xuất nhập khẩu' },
  { value: 'manufacturing', label: 'Sản xuất / cơ khí' },
  { value: 'medicine', label: 'Y tế' },
  { value: 'law', label: 'Pháp lý' },
  { value: 'custom', label: 'Ngành khác — tự nhập' },
]

interface TranslationPanelProps {
  dictionaryQuery: string
  onSearchQuery: (query: string) => void
}

function getRecognitionError(error: string): string {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'Chưa được cấp quyền dùng micro. Hãy cho phép trong trình duyệt rồi thử lại.'
  if (error === 'no-speech') return 'Chưa nghe thấy tiếng nói. Hãy thử đọc lại gần micro hơn.'
  if (error === 'network') return 'Nhận diện giọng nói của trình duyệt cần kết nối mạng.'
  if (error === 'audio-capture') return 'Không tìm thấy micro trên thiết bị.'
  if (error === 'aborted') return ''
  return 'Trình duyệt không nhận diện được lần này. Bạn có thể nhập câu bằng bàn phím.'
}

export function TranslationPanel({ dictionaryQuery, onSearchQuery }: TranslationPanelProps) {
  const [direction, setDirection] = useState<Direction>('auto')
  const [industry, setIndustry] = useState<Industry>('trade')
  const [customIndustry, setCustomIndustry] = useState('')
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(supportsSpeechRecognition)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [error, setError] = useState('')
  const [showPreviewStatus, setShowPreviewStatus] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null)

  useEffect(() => () => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
  }, [])

  const sourceLanguage = direction === 'auto' ? 'tự nhận diện tiếng Trung/Việt' : direction === 'zh-vi' ? 'tiếng Trung' : 'tiếng Việt'
  const targetLanguage = direction === 'auto' ? 'ngôn ngữ còn lại' : direction === 'zh-vi' ? 'tiếng Việt' : 'tiếng Trung'

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    if (direction === 'auto') {
      setError('Tự nhận diện chiều nói cần mô hình tự host và chưa hoạt động trong bản xem trước. Hãy chọn một chiều cụ thể để thử micro, hoặc nhập câu bằng bàn phím.')
      return
    }

    if (!window.isSecureContext) {
      setError('Micro trên thiết bị cần HTTPS hoặc localhost. Hãy mở website qua HTTPS rồi thử lại.')
      return
    }

    const recognitionLanguage = direction === 'zh-vi' ? 'zh-CN' : 'vi-VN'
    const recognition = createSpeechRecognition(recognitionLanguage)
    if (!recognition) {
      setSupported(false)
      setError('Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nhập câu bằng bàn phím.')
      return
    }

    setSupported(true)
    setError('')
    setLiveTranscript('')
    setShowPreviewStatus(false)
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    setListening(true)

    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      const finalParts: string[] = []
      const interimParts: string[] = []
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const spoken = result[0]?.transcript?.trim() ?? ''
        if (result.isFinal && spoken) finalParts.push(spoken)
        else if (spoken) interimParts.push(spoken)
      }
      if (interimParts.length) setLiveTranscript(interimParts.join(' '))
      if (finalParts.length) {
        setText(finalParts.join(' '))
        setLiveTranscript('')
      }
    }
    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const message = getRecognitionError(event.error)
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
      setError('Chưa thể mở micro. Hãy thử lại sau giây lát hoặc nhập câu bằng bàn phím.')
      recognitionRef.current = null
    }
  }

  function loadDictionaryQuery() {
    setText(dictionaryQuery)
    setShowPreviewStatus(false)
    setError('')
  }

  function showUnconfiguredPreview() {
    if (!text.trim()) {
      setError('Nhập câu hoặc nói vào micro trước khi tiếp tục.')
      return
    }
    setError('')
    setShowPreviewStatus(true)
  }

  return <section className="translation-panel" aria-labelledby="translation-title">
    <div className="translation-panel-heading">
      <div>
        <span className="eyebrow">BẢN XEM TRƯỚC · CHƯA NỐI MÔ HÌNH</span>
        <h2 id="translation-title"><Languages size={19} /> Dịch câu theo ngành</h2>
        <p>Tra câu dài và thử luồng micro hai chiều Trung–Việt.</p>
      </div>
      <span className="translation-preview-mark"><WandSparkles size={16} /></span>
    </div>

    <div className="translation-directions" role="group" aria-label="Chiều dịch">
      <button type="button" className={direction === 'zh-vi' ? 'translation-direction selected' : 'translation-direction'} aria-pressed={direction === 'zh-vi'} onClick={() => { setDirection('zh-vi'); setError(''); setShowPreviewStatus(false) }}>
        <span className="hanzi">中文</span><span>Trung → Việt</span>
      </button>
      <button type="button" className={direction === 'vi-zh' ? 'translation-direction selected' : 'translation-direction'} aria-pressed={direction === 'vi-zh'} onClick={() => { setDirection('vi-zh'); setError(''); setShowPreviewStatus(false) }}>
        <span>Tiếng Việt</span><ArrowLeftRight size={14} /><span className="hanzi">中文</span>
      </button>
      <button type="button" className={direction === 'auto' ? 'translation-direction selected' : 'translation-direction'} aria-pressed={direction === 'auto'} onClick={() => { setDirection('auto'); setError(''); setShowPreviewStatus(false) }}>
        <span>Tự nhận diện</span>
      </button>
    </div>
    {direction === 'auto' && <p className="translation-unsupported" role="status">Nói tiếng Trung → dịch sang tiếng Việt; nói tiếng Việt → dịch sang tiếng Trung. Tự nhận diện giọng nói cần mô hình tự host, chưa hoạt động trong bản xem trước.</p>}

    <label className="translation-field-label" htmlFor="translation-industry">LĨNH VỰC THUẬT NGỮ</label>
    <select id="translation-industry" className="translation-industry-select" value={industry} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setIndustry(event.target.value as Industry); setShowPreviewStatus(false) }}>
      {industries.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
    </select>
    {industry === 'custom' && <label className="translation-field-label custom-industry-field">TÊN NGÀNH
      <input value={customIndustry} onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomIndustry(event.target.value)} placeholder="Ví dụ: logistics, điện tử…" maxLength={80} />
    </label>}

    <label className="translation-field-label" htmlFor="translation-input">CÂU NGUỒN · {sourceLanguage.toLocaleUpperCase('vi')}</label>
    <textarea id="translation-input" className="translation-textarea" value={text} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => { setText(event.target.value); setError(''); setShowPreviewStatus(false) }} placeholder={direction === 'auto' ? 'Nhập câu tiếng Trung hoặc tiếng Việt…' : direction === 'zh-vi' ? 'Nhập hoặc đọc câu tiếng Trung…' : 'Nhập hoặc đọc câu tiếng Việt…'} maxLength={2000} />

    {!supported && <p className="translation-unsupported" role="status">Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bạn vẫn có thể nhập hoặc dán câu để tra cứu.</p>}
    {listening && <p className="translation-live" aria-live="polite">{liveTranscript ? `Đang nghe: ${liveTranscript}` : `Đang nghe tiếng ${direction === 'zh-vi' ? 'Trung' : 'Việt'}…`}</p>}
    {error && <p className="translation-error" role="alert">{error}</p>}

    <div className="translation-actions">
      <button type="button" className={listening ? 'button button-secondary' : 'button button-secondary'} onClick={toggleListening}>
        {listening ? <><Square size={15} /> Dừng nghe</> : <><Mic size={16} /> {direction === 'auto' ? 'Nói Trung / Việt' : `Nói tiếng ${direction === 'zh-vi' ? 'Trung' : 'Việt'}`}</>}
      </button>
      <button type="button" className="button button-secondary" onClick={loadDictionaryQuery} disabled={!dictionaryQuery.trim()}>
        <Search size={15} /> Lấy câu đang tra
      </button>
      <button type="button" className="button button-secondary" onClick={() => onSearchQuery(text.trim())} disabled={!text.trim()}>
        Tra từ trong câu
      </button>
      <button type="button" className="button button-primary" onClick={showUnconfiguredPreview} disabled={!text.trim()}>
        Xem vị trí bản dịch
      </button>
    </div>

    <div className="translation-result" aria-live="polite">
      <div className="translation-result-heading"><span>KẾT QUẢ · {targetLanguage.toLocaleUpperCase('vi')}</span><span className="translation-result-pill">{industry === 'custom' ? (customIndustry.trim() || 'Ngành tùy chọn') : industries.find((option) => option.value === industry)?.label}</span></div>
      {showPreviewStatus ? <p className="translation-result-placeholder">{direction === 'auto' ? 'Mô hình tự host chưa được kết nối, nên chưa tự nhận diện ngôn ngữ nói, chưa gửi câu đi và chưa tạo bản dịch.' : `Đây là chỗ hiển thị bản dịch ${targetLanguage}. Mô hình tự host chưa được kết nối, nên chưa gửi câu đi và chưa tạo bản dịch.`}</p> : <p className="translation-result-placeholder">{direction === 'auto' ? 'Nhập câu để xem trước luồng dịch tự động. Chưa có nhận diện giọng nói hoặc bản dịch thật trong chế độ xem trước.' : 'Nhập hoặc đọc một câu để xem trước luồng dịch. Chưa có bản dịch thật trong chế độ xem trước.'}</p>}
    </div>

    <p className="translation-disclaimer">Micro cần quyền của trình duyệt và thường cần HTTPS; nhận diện ở hai chiều thủ công có thể được xử lý bởi dịch vụ giọng nói của trình duyệt. Chế độ tự nhận diện chiều nói cần mô hình tự host và chưa hoạt động trong bản xem trước. Khi kết nối mô hình tự host, bản dịch y tế/pháp lý chỉ mang tính tham khảo, không thay tư vấn chuyên môn.</p>
  </section>
}
