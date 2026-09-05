import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('gamatria', {
  version: '1.0.0'
})
