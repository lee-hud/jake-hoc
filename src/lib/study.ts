import type { ProgressMap, VocabItem } from '../types'

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function makeDeck(items: VocabItem[], progress: ProgressMap, level: number, reviewOnly: boolean, size = 12): VocabItem[] {
  const pool = items.filter((item) => item.level === level && (!reviewOnly || progress[item.id]?.status === 'review'))
  const ordered = shuffle(pool)
  return ordered.slice(0, Math.min(size, ordered.length))
}

export interface QuizQuestion {
  id: string
  promptKind: 'meaning' | 'character'
  prompt: string
  answer: string
  options: string[]
  pinyin: string
}

export function makeQuiz(items: VocabItem[], progress: ProgressMap, level: number, reviewOnly: boolean, size = 10): QuizQuestion[] {
  const pool = items.filter((item) => item.level === level && (!reviewOnly || progress[item.id]?.status === 'review'))
  return shuffle(pool).slice(0, Math.min(size, pool.length)).map((item) => {
    const promptKind = Math.random() < 0.5 ? 'meaning' : 'character'
    const answer = promptKind === 'meaning' ? item.word : item.meaning
    const distractors = shuffle(pool.filter((other) => other.id !== item.id))
      .map((other) => promptKind === 'meaning' ? other.word : other.meaning)
      .filter((choice) => choice !== answer)
    return {
      id: item.id,
      promptKind,
      prompt: promptKind === 'meaning' ? item.meaning : item.word,
      answer,
      options: shuffle([answer, ...[...new Set(distractors)].slice(0, 3)]),
      pinyin: item.pinyin,
    }
  })
}

export function normalizeAnswer(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, '')
}

export function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]/gu, '')
}

export function matchesDictionaryPhrase(item: VocabItem, query: string): boolean {
  const normalizedQuery = normalizeSearch(query)
  if (!normalizedQuery) return false

  const searchableFields = [item.word, item.pinyin, item.meaning, item.partOfSpeech, item.gloss]
  const normalizedFields = normalizeSearch(searchableFields.join(' '))
  const containsChinese = /[\u3400-\u9fff\uf900-\ufaff]/u.test(query)

  if (containsChinese) {
    const word = normalizeSearch(item.word)
    if (word && normalizedQuery.includes(word)) return true
  }

  const tokens = (query.match(/[\p{L}\p{N}]+/gu) ?? [])
    .map(normalizeSearch)
    .filter((token) => token.length >= 3)
  return tokens.some((token) => normalizedFields.includes(token))
}
