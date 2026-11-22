import { Download, Smartphone } from 'lucide-react'

interface HeaderProps {
  onInstall: () => void
  canInstall: boolean
}

export function Header({ onInstall, canInstall }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <img src="/icons/mark.svg" className="brand-mark" alt="" />
        <div>
          <div className="brand-name">Jake Học</div>
          <div className="brand-caption">SỔ TAY TỪ VỰNG</div>
        </div>
      </div>
      <button className="install-button" onClick={onInstall} aria-label="Cài Jake Học lên màn hình chính">
        {canInstall ? <Download size={17} /> : <Smartphone size={17} />}
        <span>{canInstall ? 'Cài ứng dụng' : 'Thêm vào máy'}</span>
      </button>
    </header>
  )
}
