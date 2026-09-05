import { HEBREW_VALUES } from './hebrewValues'

export interface GematriaLetter {
  letter: string
  value: number
}

export interface GematriaResult {
  original: string
  letters: GematriaLetter[]
  total: number
}

export function calculateGematria(text: string): GematriaResult {
  const letters: GematriaLetter[] = []

  for (const char of text.normalize('NFD')) {
    const value = HEBREW_VALUES[char]

    if (value !== undefined) {
      letters.push({
        letter: char,
        value
      })
    }
  }

  return {
    original: text,
    letters,
    total: letters.reduce((sum, item) => sum + item.value, 0)
  }
}