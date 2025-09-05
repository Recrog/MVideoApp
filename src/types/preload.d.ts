export {}

declare global {
  interface Window {
    api?: {
      openFiles?: (filters?: Electron.FileFilter[]) => Promise<string[]>
      onToggleRecord?: (cb: () => void) => () => void
      saveBlob?: (buffer: ArrayBuffer, ext: string) => Promise<string>
      exportTimeline?: (items: unknown) => Promise<string>
    }
  }
}


