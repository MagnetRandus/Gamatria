import { calculateGematria } from '../gematria/calculateGematria'

export interface PhoneticCandidate {
  hebrew: string
  value: number
  label: string
}

const CONSONANTS: Record<string, string> = {
  b: 'ב',
  c: 'ק',
  d: 'ד',
  f: 'פ',
  g: 'ג',
  h: 'ה',
  j: 'י',
  k: 'ק',
  l: 'ל',
  m: 'מ',
  n: 'נ',
  p: 'פ',
  q: 'ק',
  r: 'ר',
  s: 'ס',
  t: 'ת',
  v: 'ו',
  w: 'ו',
  x: 'קס',
  y: 'י',
  z: 'ז'
}

const DIGRAPHS: Record<string, string> = {
  sh: 'ש',
  ch: 'ח',
  kh: 'כ',
  ph: 'פ',
  th: 'ת',
  ts: 'צ',
  tz: 'צ'
}

function normalizeEnglish(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z' -]/g, '')
    .replace(/\s+/g, ' ')
}

function applyFinalLetters(text: string): string {
  const finalForms: Record<string, string> = {
    כ: 'ך',
    מ: 'ם',
    נ: 'ן',
    פ: 'ף',
    צ: 'ץ'
  }

  return text
    .split(' ')
    .map((word) => {
      if (!word) return word
      const last = word.at(-1) ?? ''
      const replacement = finalForms[last]
      return replacement ? `${word.slice(0, -1)}${replacement}` : word
    })
    .join(' ')
}

function transliterate(value: string, includeOuVowels: boolean): string {
  const input = normalizeEnglish(value)
  let hebrew = ''

  for (let index = 0; index < input.length; index++) {
    const char = input[index]

    if (char === ' ') {
      hebrew += ' '
      continue
    }

    if (char === '-' || char === "'") {
      continue
    }

    const pair = input.slice(index, index + 2)
    const digraph = DIGRAPHS[pair]

    if (digraph) {
      hebrew += digraph
      index++
      continue
    }

    if (char === 'a' || char === 'e') {
      if (index === 0 || input[index - 1] === ' ') {
        hebrew += 'א'
      }
      continue
    }

    if (char === 'i') {
      hebrew += 'י'
      continue
    }

    if (char === 'o' || char === 'u') {
      if (includeOuVowels || index === 0 || input[index - 1] === ' ') {
        hebrew += 'ו'
      }
      continue
    }

    hebrew += CONSONANTS[char] ?? ''
  }

  return applyFinalLetters(hebrew)
}

function addAlephForEarlyA(value: string, baseHebrew: string): string | null {
  const input = normalizeEnglish(value)

  if (!/^[bcdfghjklmnpqrstvwxyz]a/.test(input)) {
    return null
  }

  const firstSpace = baseHebrew.indexOf(' ')
  const firstWord = firstSpace === -1 ? baseHebrew : baseHebrew.slice(0, firstSpace)
  const remainder = firstSpace === -1 ? '' : baseHebrew.slice(firstSpace)

  if (firstWord.length < 2) {
    return null
  }

  return applyFinalLetters(`${firstWord[0]}א${firstWord.slice(1)}${remainder}`)
}

export function generateHebrewCandidates(value: string): PhoneticCandidate[] {
  const input = normalizeEnglish(value)

  if (!input) {
    return []
  }

  const full = transliterate(input, true)
  const reduced = transliterate(input, false)
  const aleph = addAlephForEarlyA(input, full)

  const rawCandidates: Array<{ hebrew: string; label: string }> = [
    { hebrew: reduced, label: 'Reduced vowel spelling' },
    { hebrew: full, label: 'Full vowel spelling' }
  ]

  if (aleph) {
    rawCandidates.push({ hebrew: aleph, label: 'Aleph vowel variant' })
  }

  const unique = new Map<string, PhoneticCandidate>()

  for (const candidate of rawCandidates) {
    if (!candidate.hebrew || unique.has(candidate.hebrew)) {
      continue
    }

    unique.set(candidate.hebrew, {
      hebrew: candidate.hebrew,
      value: calculateGematria(candidate.hebrew).total,
      label: candidate.label
    })
  }

  return Array.from(unique.values()).sort((a, b) => a.value - b.value)
}
