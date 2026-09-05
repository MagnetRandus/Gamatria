import { calculateGematria } from '../../shared/gematria/calculateGematria'

type MorphWord = [
  surface: string,
  lemma?: string,
  morphology?: string
]

type BibleCorpus = Record<string, MorphWord[][][]>

const bible = require('morphhb') as BibleCorpus

export interface BiblePhraseMatch {
  book: string
  chapter: number
  verse: number
  source: string
  hebrew: string
  value: number
  wordCount: number
}

function normalizeSurface(surface: string): string {
  return surface.replace(/\//g, '')
}

export function findPhraseMatches(
  target: number,
  minimumWords = 2
): BiblePhraseMatch[] {
  const matches: BiblePhraseMatch[] = []

  for (const [book, chapters] of Object.entries(bible)) {
    chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((verse, verseIndex) => {
        const words = verse
          .filter(
            (word): word is MorphWord =>
              Array.isArray(word) && typeof word[0] === 'string'
          )
          .map((word) => ({
            source: word[0],
            hebrew: normalizeSurface(word[0]),
            value: calculateGematria(
              normalizeSurface(word[0])
            ).total
          }))

        for (let start = 0; start < words.length; start++) {
          let total = 0

          for (let end = start; end < words.length; end++) {
            total += words[end].value

            const wordCount = end - start + 1

            if (
              total === target &&
              wordCount >= minimumWords
            ) {
              const phrase = words.slice(start, end + 1)

              matches.push({
                book,
                chapter: chapterIndex + 1,
                verse: verseIndex + 1,
                source: phrase
                  .map((word) => word.source)
                  .join(' '),
                hebrew: phrase
                  .map((word) => word.hebrew)
                  .join(' '),
                value: total,
                wordCount
              })
            }

            if (total > target) {
              break
            }
          }
        }
      })
    })
  }

  return matches
}
