import type { BibleSearchResult } from '../../shared/bible/types'

declare global {
  interface Window {
    gamatria: {
      version: string
      searchBible: (target: number) => Promise<BibleSearchResult>
      openExternal: (url: string) => Promise<void>
    }
  }
}

export {}
