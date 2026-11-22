export interface VocabItem {
  id: string
  level: number
  word: string
  pinyin: string
  meaning: string
  partOfSpeech: string
  gloss: string
}

export interface AudioPackInfo {
  count: number
  bytes: number
  downloadMB: number
  path: string
}

export type KnowledgeStatus = 'learned' | 'review'

export interface WordProgress {
  status: KnowledgeStatus
  attempts: number
  correct: number
}

export type StudyMode = 'flash' | 'typing' | 'pronunciation'

export type ProgressMap = Record<string, WordProgress>

export type TabId = 'home' | 'study' | 'quiz' | 'dictionary' | 'progress'
