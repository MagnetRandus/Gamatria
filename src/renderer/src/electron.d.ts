import type { BibleSearchResult } from '../../shared/bible/types'

declare global {
  interface Window {
    gamatria: {
      version: string
      searchBible: (target: number) => Promise<BibleSearchResult>
    }
  }
}

export {}
