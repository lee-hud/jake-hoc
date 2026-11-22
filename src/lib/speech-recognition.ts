export interface SpeechRecognitionAlternativeLike {
  transcript: string
  confidence: number
}

export interface SpeechRecognitionResultLike {
  readonly length: number
  readonly isFinal: boolean
  readonly [index: number]: SpeechRecognitionAlternativeLike
}

export interface SpeechRecognitionResultsLike {
  readonly length: number
  readonly [index: number]: SpeechRecognitionResultLike
}

export interface SpeechRecognitionResultEventLike extends Event {
  resultIndex: number
  results: SpeechRecognitionResultsLike
}

export interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}

export interface SpeechRecognitionInstanceLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstanceLike
  webkitSpeechRecognition?: new () => SpeechRecognitionInstanceLike
}

export type SpeechRecognitionLanguage = 'zh-CN' | 'vi-VN'

function getRecognitionConstructor() {
  if (typeof window === 'undefined') return undefined
  const speechWindow = window as SpeechRecognitionWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

export function supportsSpeechRecognition(): boolean {
  return Boolean(getRecognitionConstructor())
}

export function createSpeechRecognition(language: SpeechRecognitionLanguage): SpeechRecognitionInstanceLike | null {
  const Recognition = getRecognitionConstructor()
  if (!Recognition) return null
  const recognition = new Recognition()
  recognition.lang = language
  return recognition
}

export function supportsMandarinSpeechRecognition(): boolean {
  return supportsSpeechRecognition()
}

export function createMandarinSpeechRecognition(): SpeechRecognitionInstanceLike | null {
  return createSpeechRecognition('zh-CN')
}
