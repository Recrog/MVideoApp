import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs/promises'
import os from 'node:os'
import { spawn } from 'node:child_process'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

let mainWindow: BrowserWindow | null = null

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    await mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexHtml = url.pathToFileURL(path.join(__dirname, '../dist/index.html')).toString()
    await mainWindow.loadURL(indexHtml)
  }

  globalShortcut.register('F4', () => {
    mainWindow?.webContents.send('toggle-record')
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('dialog:openFiles', async (_e, filters?: Electron.FileFilter[]) => {
  const res = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters })
  return res.canceled ? [] : res.filePaths
})

ipcMain.handle('fs:saveTempBlob', async (_e, buffer: ArrayBuffer, ext: string) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'promo-'))
  const file = path.join(dir, `capture_${Date.now()}.${ext.replace(/^\./, '')}`)
  await fs.writeFile(file, Buffer.from(buffer))
  return file
})

ipcMain.handle('ffmpeg:exportTimeline', async (_e, items: any[]) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'promo-export-'))
  const out = path.join(dir, 'export.mp4')

  // For each item, build a temp clip path
  const clipPaths: string[] = []
  for (const it of items) {
    if (it.type === 'image') {
      const clip = path.join(dir, `img_${clipPaths.length}.mp4`)
      const duration = Math.max(1, Number(it.durationSec || 3))
      const args = [
        '-y',
        '-loop', '1', '-t', String(duration), '-i', it.path,
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black',
        '-r', '30', '-pix_fmt', 'yuv420p', clip,
      ]
      await runFfmpeg(args)
      clipPaths.push(clip)
    } else if (it.type === 'video') {
      const clip = path.join(dir, `vid_${clipPaths.length}.mp4`)
      const baseArgs = ['-y', '-ss', String(Math.max(0, Number(it.inSec || 0))), '-i', it.path]
      if (Number(it.outSec || 0) > 0) {
        const dur = Math.max(0, Number(it.outSec) - Math.max(0, Number(it.inSec || 0)))
        if (dur > 0) {
          baseArgs.push('-t', String(dur))
        }
      }
      if (it.overlayAudioPath || (it.overlays && it.overlays.length)) {
        // Build filter_complex with multiple audio inputs mixed
        const args = [...baseArgs]
        const overlayInputs = [] as { path: string; offset: number }[]
        if (it.overlayAudioPath) overlayInputs.push({ path: it.overlayAudioPath, offset: Math.max(0, Number(it.overlayAudioStartSec || 0)) })
        for (const o of it.overlays || []) overlayInputs.push({ path: o.path, offset: Math.max(0, Number(o.startSec || 0)) })
        overlayInputs.forEach(({ path: p, offset }) => {
          args.push('-itsoffset', String(offset), '-i', p)
        })
        const totalInputs = 1 + overlayInputs.length // 0: video+maybe audio, others: extra audios
        const audioInputs = overlayInputs.length + 1 // use base audio if present
        // Build amix filter mapping: take audio from all audio inputs (skip 0:v)
        // Map 0:v:0 as video, and 0:a:0 if exists + others
        const filter = `amix=inputs=${audioInputs}:duration=shortest:dropout_transition=0`
        args.push('-filter_complex', filter)
        // Map audio streams: assume first audio present among inputs
        args.push('-map', `${totalInputs-1}:a?`)
        args.push('-c:v', 'copy', '-c:a', 'aac', '-shortest', clip)
        await runFfmpeg(args)
      } else {
        const args = [
          ...baseArgs,
          '-c:v', 'copy', '-c:a', 'aac', clip,
        ]
        await runFfmpeg(args)
      }
      clipPaths.push(clip)
    }
  }

  // Concat all clips
  const listPath = path.join(dir, 'concat.txt')
  await fs.writeFile(listPath, clipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n')
  await runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', out])
  return out
})

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpegPath.path, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg failed'))))
  })
}


