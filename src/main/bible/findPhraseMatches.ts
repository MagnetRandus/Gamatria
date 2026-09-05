import { calculateGematria } from '../../shared/gematria/calculateGematria'
import type {
  BiblePhraseMatch,
  BiblePhraseToken
} from '../../shared/bible/types'

type MorphWord = [
  surface: string,
  lemma?: string,
  morphology?: string
]

type BibleCorpus = Record<string, MorphWord[][][]>

const bible = require('morphhb') as BibleCorpus

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
        const words: BiblePhraseToken[] = verse
          .filter(
            (word): word is MorphWord =>
              Array.isArray(word) && typeof word[0] === 'string'
          )
          .map((word) => {
            const [source, lemma, morphology] = word
            const hebrew = normalizeSurface(source)

            return {
              source,
              hebrew,
              lemma,
              morphology,
              value: calculateGematria(hebrew).total
            }
          })

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
                wordCount,
                tokens: phrase
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
