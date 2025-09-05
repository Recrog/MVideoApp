import type { TimelineItem, ImageItem, VideoItem } from '../types/media'

export type PreviewRecorderState = 'idle' | 'starting' | 'recording' | 'stopped' | 'error'

type DrawContext = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  imageEl: HTMLImageElement
  videoEl: HTMLVideoElement
}

export function usePreviewRecorder(getSelectedItem: () => TimelineItem | undefined, onSaved: (filePath: string) => void) {
  let state: PreviewRecorderState = 'idle'
  let mediaStream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let chunks: BlobPart[] = []
  let rafId = 0
  let startedAt = 0
  const width = 1280
  const height = 720

  function ensureDrawContext(): DrawContext {
    const canvas = document.getElementById('preview-record-canvas') as HTMLCanvasElement
    if (!canvas) throw new Error('preview-record-canvas not found')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const imageEl = new Image()
    imageEl.crossOrigin = 'anonymous'
    const videoEl = document.createElement('video')
    videoEl.crossOrigin = 'anonymous'
    videoEl.muted = true
    videoEl.playsInline = true as any
    videoEl.preload = 'auto'
    return { canvas, ctx, imageEl, videoEl }
  }

  function fitContain(iw: number, ih: number, tw: number, th: number) {
    const scale = Math.min(tw / iw, th / ih)
    const w = iw * scale
    const h = ih * scale
    return { w, h, x: (tw - w) / 2, y: (th - h) / 2 }
  }

  function drawLoop(dc: DrawContext) {
    const it = getSelectedItem()
    dc.ctx.fillStyle = '#000'
    dc.ctx.fillRect(0, 0, width, height)
    if (it && it.type === 'image' && dc.imageEl.naturalWidth) {
      const box = fitContain(dc.imageEl.naturalWidth, dc.imageEl.naturalHeight, width, height)
      dc.ctx.drawImage(dc.imageEl, box.x, box.y, box.w, box.h)
      const img = it as ImageItem
      // label bg
      const lw = 260, lh = 90
      dc.ctx.fillStyle = 'rgba(0,0,0,0.66)'
      dc.ctx.beginPath()
      dc.ctx.roundRect(width - lw - 24, height - lh - 24, lw, lh, 12 as any)
      dc.ctx.fill()
      // texts
      dc.ctx.fillStyle = '#fff'
      dc.ctx.font = '22px sans-serif'
      dc.ctx.fillText(img.label.title, width - lw - 12, height - lh + 12 + 22)
      dc.ctx.fillStyle = '#7CFC00'
      dc.ctx.font = 'bold 26px sans-serif'
      dc.ctx.fillText(img.label.price, width - lw - 12, height - lh + 12 + 22 + 26 + 6)
    }
    if (it && it.type === 'video' && dc.videoEl.videoWidth) {
      const box = fitContain(dc.videoEl.videoWidth, dc.videoEl.videoHeight, width, height)
      dc.ctx.drawImage(dc.videoEl, box.x, box.y, box.w, box.h)
    }
    rafId = requestAnimationFrame(() => drawLoop(dc))
  }

  async function start() {
    if (state === 'recording' || state === 'starting') return
    try {
      const dc = ensureDrawContext()
      // preload current media elements based on selected item and keep updating src on selection changes
      const it = getSelectedItem()
      if (it?.type === 'image') {
        dc.imageEl.src = encodeURI(`file:///${(it as ImageItem).path.replace(/\\/g, '/')}`)
      }
      if (it?.type === 'video') {
        dc.videoEl.src = encodeURI(`file:///${(it as VideoItem).path.replace(/\\/g, '/')}`)
        await dc.videoEl.play().catch(() => undefined)
      }

      // capture canvas stream
      const canvasStream = dc.canvas.captureStream(30)
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...mic.getAudioTracks(),
      ])

      // draw loop
      drawLoop(dc)

      const mimeCandidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ]
      const mimeType = mimeCandidates.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t)) || ''
      recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined)
      chunks = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstart = () => {
        state = 'recording'
        window.dispatchEvent(new CustomEvent('recording:state', { detail: { state } }))
      }
      recorder.onstop = async () => {
        try {
          cancelAnimationFrame(rafId)
          const blob = new Blob(chunks, { type: 'video/webm' })
          const buffer = await blob.arrayBuffer()
          const saved = await window.api?.saveBlob?.(buffer, 'webm')
          if (saved) onSaved(saved)
        } catch (e) {
          console.error(e)
          state = 'error'
        } finally {
          mediaStream?.getTracks().forEach((t) => t.stop())
          mediaStream = null
          recorder = null
          chunks = []
          state = 'stopped'
          window.dispatchEvent(new CustomEvent('recording:state', { detail: { state } }))
        }
      }
      state = 'starting'
      window.dispatchEvent(new CustomEvent('recording:state', { detail: { state } }))
      startedAt = Date.now()
      recorder.start(250) // emit chunks every 250ms
    } catch (e) {
      console.error(e)
      state = 'error'
      window.dispatchEvent(new CustomEvent('recording:state', { detail: { state } }))
    }
  }

  function stop() {
    if (!recorder) return
    // avoid 0s files: require at least 800ms elapsed and at least one chunk
    if (state !== 'recording' || Date.now() - startedAt < 800 || chunks.length === 0) return
    try {
      recorder.requestData()
    } catch {}
    recorder.stop()
  }

  async function toggle() {
    if (state === 'recording') stop()
    else await start()
  }

  return { start, stop, toggle, getState: () => state }
}


