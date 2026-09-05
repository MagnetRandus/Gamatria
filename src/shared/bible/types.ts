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

export interface BiblePhraseMatch {
  book: string
  chapter: number
  verse: number
  source: string
  hebrew: string
  value: number
  wordCount: number
}

export interface BibleSearchResult {
  target: number
  wordMatches: BibleWordMatch[]
  phraseMatches: BiblePhraseMatch[]
}
