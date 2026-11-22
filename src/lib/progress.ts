import type { ProgressMap, WordProgress } from '../types'

const STORAGE_KEY = 'hanzi-hoc-progress-v1'

export function readProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Partial<WordProgress>>
    const clean: ProgressMap = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (value.status !== 'learned' && value.status !== 'review') continue
      clean[id] = {
        status: value.status,
        attempts: Math.max(0, Number(value.attempts) || 0),
        correct: Math.max(0, Number(value.correct) || 0),
      }
    }
    return clean
  } catch {
    return {}
  }
}

export function saveProgress(progress: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage may be unavailable in private browsing; in-memory state remains usable.
  }
}

export function setKnowledge(progress: ProgressMap, id: string, status: 'learned' | 'review'): ProgressMap {
  const previous = progress[id]
  return {
    ...progress,
    [id]: {
      status,
      attempts: previous?.attempts ?? 0,
      correct: previous?.correct ?? 0,
    },
  }
}

export function recordAttempt(progress: ProgressMap, id: string, isCorrect: boolean): ProgressMap {
  const previous = progress[id] ?? { status: 'review' as const, attempts: 0, correct: 0 }
  return {
    ...progress,
    [id]: {
      status: isCorrect ? 'learned' : 'review',
      attempts: previous.attempts + 1,
      correct: previous.correct + Number(isCorrect),
    },
  }
}

export function summarizeProgress(progress: ProgressMap) {
  let learned = 0
  let review = 0
  let attempts = 0
  let correct = 0
  for (const item of Object.values(progress)) {
    if (item.status === 'learned') learned += 1
    if (item.status === 'review') review += 1
    attempts += item.attempts
    correct += item.correct
  }
  return { learned, review, attempts, correct }
}
