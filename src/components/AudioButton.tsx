import { useState } from 'react'
import { LoaderCircle, Volume2 } from 'lucide-react'
import { playPronunciation } from '../lib/audio'
import type { VocabItem } from '../types'

interface AudioButtonProps {
  item: VocabItem
  compact?: boolean
  downloadMB?: number
}

export function AudioButton({ item, compact = false, downloadMB }: AudioButtonProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handlePlay() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await playPronunciation(item.id, item.level)
    } catch {
      setError('Thử lại khi có kết nối mạng.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`audio-control ${compact ? 'audio-control-compact' : ''}`}>
      <button className={`audio-button ${compact ? 'audio-button-compact' : ''}`} onClick={handlePlay} disabled={busy} aria-label={`Nghe phát âm ${item.word}`} title={`Nghe ${item.word}`}>
        {busy ? <LoaderCircle size={compact ? 17 : 20} className="spin" /> : <Volume2 size={compact ? 17 : 20} />}
        {!compact && <span>{busy ? 'Đang tải âm thanh…' : 'Nghe phát âm'}</span>}
      </button>
      {!compact && <span className="audio-note">{downloadMB ? `Lần đầu tải gói HSK ${item.level} · ${downloadMB} MB` : 'Âm thanh của cấp này sẽ tải ở lần nghe đầu'}</span>}
      {error && <span className="audio-error" role="status">{error}</span>}
    </div>
  )
}
