import { unzipSync } from 'fflate'

const packPromises = new Map<number, Promise<Record<string, Uint8Array>>>()
const objectUrls = new Map<string, string>()
let player: HTMLAudioElement | null = null

async function loadPack(level: number): Promise<Record<string, Uint8Array>> {
  const existing = packPromises.get(level)
  if (existing) return existing
  const pending = fetch(`/audio/hsk${level}.zip`).then(async (response) => {
    if (!response.ok) throw new Error(`Không tải được gói âm thanh HSK ${level}.`)
    const bytes = new Uint8Array(await response.arrayBuffer())
    return unzipSync(bytes)
  }).catch((error) => {
    packPromises.delete(level)
    throw error
  })
  packPromises.set(level, pending)
  return pending
}

export async function playPronunciation(id: string, level: number): Promise<void> {
  const key = `${level}:${id}`
  let url = objectUrls.get(key)
  if (!url) {
    const files = await loadPack(level)
    const bytes = files[`${id}.mp3`]
    if (!bytes) throw new Error('Chưa tìm thấy file phát âm cho từ này.')
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    url = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }))
    objectUrls.set(key, url)
  }
  if (!player) player = new Audio()
  player.pause()
  player.src = url
  player.currentTime = 0
  await player.play()
}
