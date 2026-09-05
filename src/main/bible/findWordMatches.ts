
import { calculateGematria } from '../../shared/gematria/calculateGematria'

type MorphWord = [
  surface: string,
  lemma?: string,
  morphology?: string
]

type BibleCorpus = Record<string, MorphWord[][][]>

const bible = require('morphhb') as BibleCorpus

export interface BibleWordMatch {
  book: string
  chapter: number
  verse: number
  source: string
  hebrew: string
  lemma?: string
  morphology?: string
  value: number
}

function normalizeSurface(surface: string): string {
  return surface.replace(/\//g, '')
}

export function findWordMatches(target: number): BibleWordMatch[] {
  const matches: BibleWordMatch[] = []

  for (const [book, chapters] of Object.entries(bible)) {
    chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((verse, verseIndex) => {
        verse.forEach((word) => {
          if (!Array.isArray(word) || typeof word[0] !== 'string') {
            return
          }

          const [source, lemma, morphology] = word
          const hebrew = normalizeSurface(source)
          const value = calculateGematria(hebrew).total

          if (value === target) {
            matches.push({
              book,
              chapter: chapterIndex + 1,
              verse: verseIndex + 1,
              source,
              hebrew,
              lemma,
              morphology,
              value
            })
          }
        })
      })
    })
  }

  return matches
}