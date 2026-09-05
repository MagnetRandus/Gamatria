import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { findWordMatches } from './bible/findWordMatches'
import { findPhraseMatches } from './bible/findPhraseMatches'
import type { BibleSearchResult } from '../shared/bible/types'

function registerIpcHandlers(): void {
  ipcMain.handle(
    'gamatria:search-bible',
    (_event, target: number): BibleSearchResult => {
      if (!Number.isFinite(target) || target <= 0) {
        throw new Error('Gematria target must be a positive number.')
      }

      return {
        target,
        wordMatches: findWordMatches(target),
        phraseMatches: findPhraseMatches(target)
      }
    }
  )

  ipcMain.handle(
    'gamatria:open-external',
    async (_event, url: string): Promise<void> => {
      const parsed = new URL(url)
      const allowedPath =
        parsed.pathname.startsWith('/amp/') ||
        parsed.pathname.startsWith('/lexicon/')

      if (
        parsed.protocol !== 'https:' ||
        parsed.hostname !== 'www.blueletterbible.org' ||
        !allowedPath
      ) {
        throw new Error('Only approved Blue Letter Bible links may be opened.')
      }

      await shell.openExternal(parsed.toString())
    }
  )
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
