import { RotateCcw, Trash2 } from 'lucide-react'
import { summarizeProgress } from '../lib/progress'
import type { ProgressMap, VocabItem } from '../types'

interface ProgressPageProps {
  items: VocabItem[]
  progress: ProgressMap
  onReset: () => void
}

export function ProgressPage({ items, progress, onReset }: ProgressPageProps) {
  const total = summarizeProgress(progress)
  const levels = [1, 2, 3, 4, 5, 6].map((level) => {
    const list = items.filter((item) => item.level === level)
    const learned = list.filter((item) => progress[item.id]?.status === 'learned').length
    const review = list.filter((item) => progress[item.id]?.status === 'review').length
    return { level, count: list.length, learned, review, pct: list.length ? Math.round(learned / list.length * 100) : 0 }
  })
  const accuracy = total.attempts ? Math.round(total.correct / total.attempts * 100) : 0

  function confirmReset() {
    if (window.confirm('Xóa toàn bộ tiến độ học trên thiết bị này? Thao tác này không thể hoàn tác.')) onReset()
  }

  return <div className="page page-inner progress-page">
    <div className="page-title-block compact-title"><span className="eyebrow">DẤU MỐC CỦA BẠN</span><h1>Mọi từ đều để lại dấu.</h1><p>Tiến độ chỉ được lưu trong trình duyệt trên thiết bị này.</p></div>
    <section className="progress-overview">
      <div className="progress-overview-main"><span className="eyebrow">TỔNG QUAN HỌC TẬP</span><div className="progress-total"><b>{total.learned.toLocaleString('vi-VN')}</b><span>/ 5.000</span></div><p>từ đã đánh dấu ghi nhớ</p><div className="overall-progress"><span style={{ width: `${Math.min(total.learned / 5000 * 100, 100)}%` }} /></div></div>
      <div className="progress-overview-stats"><div><b>{total.review}</b><span>cần ôn</span></div><div><b>{total.correct}</b><span>lượt đúng</span></div><div><b>{accuracy}%</b><span>độ chính xác</span></div></div>
      <span className="progress-deco">进</span>
    </section>

    <section className="section-card level-progress-card"><div className="section-heading"><div><span className="eyebrow">TỪNG CHẶNG</span><h3>Tiến độ theo cấp HSK</h3></div></div>
      <div className="level-progress-list">{levels.map((entry) => <div className="level-progress-row" key={entry.level}><div className="level-progress-label"><b>HSK {entry.level}</b><span>{entry.learned}/{entry.count} đã nhớ</span></div><div className="level-progress-track"><span style={{ width: `${entry.pct}%` }} /></div><div className="level-progress-percent">{entry.pct}%</div>{entry.review > 0 && <div className="level-review-note"><RotateCcw size={13} /> {entry.review} ôn</div>}</div>)}</div>
    </section>
    <section className="progress-tools"><div><span className="eyebrow">DỮ LIỆU CỦA BẠN</span><h3>Đặt lại tiến độ</h3><p>Xóa dấu đã nhớ, danh sách cần ôn và thống kê trên thiết bị này.</p></div><button className="button button-danger-soft" onClick={confirmReset}><Trash2 size={16} /> Xóa tiến độ</button></section>
    <section className="section-card source-credits"><div className="section-heading"><div><span className="eyebrow">NGUỒN & GHI CÔNG</span><h3>Dữ liệu học tập</h3></div></div>
      <p><b>Danh sách từ:</b> HSK 2.0 sáu cấp cũ (workbook HSK-2012, 5.000 mục), đối chiếu với <a href="https://www.chinesetest.cn/userfiles/file/HSK/HSK-2012.xls" target="_blank" rel="noreferrer">tài liệu CTI</a>.</p>
      <p><b>Pinyin, từ loại và gloss:</b> <a href="https://chinese-typing-practice.com/data/" target="_blank" rel="noreferrer">HSK Vocabulary Dataset</a> theo <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>; các gloss mở rộng dựa trên <a href="https://cc-cedict.org/" target="_blank" rel="noreferrer">CC-CEDICT</a> theo <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>.</p>
      <p><b>Audio:</b> <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noreferrer">hugolpz/audio-cmn · Anki-xiehanzi Old HSK 2012</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>; ghi công Yue Tan/Shtooka theo <a href="https://github.com/krmanik/Anki-xiehanzi/blob/main/License.md" target="_blank" rel="noreferrer">thông tin giấy phép của dự án</a>. Bốn mẫu câu dạng dấu ba chấm được ghép từ bản ghi các thành phần câu.</p>
      <p><b>Bản dịch tiếng Việt:</b> được dịch tự động từ gloss tiếng Anh, có thể cần đối chiếu từ điển để hiểu đúng sắc thái.</p>
    </section>
    <p className="source-note"><span className="note-mark">i</span> Nếu bạn xóa dữ liệu trình duyệt hoặc chuyển sang thiết bị khác, tiến độ cục bộ này sẽ không được khôi phục hay đồng bộ.</p>
  </div>
}
