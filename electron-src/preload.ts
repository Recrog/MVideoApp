import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  openFiles: (filters?: Electron.FileFilter[]) => ipcRenderer.invoke('dialog:openFiles', filters),
  onToggleRecord: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('toggle-record', listener)
    return () => ipcRenderer.removeListener('toggle-record', listener)
  },
  saveBlob: (buffer: ArrayBuffer, ext: string) => ipcRenderer.invoke('fs:saveTempBlob', buffer, ext),
  exportTimeline: (items: unknown) => ipcRenderer.invoke('ffmpeg:exportTimeline', items),
})

declare global {
  interface Window {
    api: {
      openFiles: (filters?: Electron.FileFilter[]) => Promise<string[]>
      onToggleRecord: (cb: () => void) => () => void
      saveBlob: (buffer: ArrayBuffer, ext: string) => Promise<string>
      exportTimeline: (items: unknown) => Promise<string>
    }
  }
}


