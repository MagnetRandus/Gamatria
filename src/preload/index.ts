import { contextBridge, ipcRenderer } from 'electron'
import type { BibleSearchResult } from '../shared/bible/types'

contextBridge.exposeInMainWorld('gamatria', {
  version: '1.0.0',
  searchBible: (target: number): Promise<BibleSearchResult> =>
    ipcRenderer.invoke('gamatria:search-bible', target)
})
