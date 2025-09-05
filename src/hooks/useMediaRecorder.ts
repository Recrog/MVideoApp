export type RecorderState = 'idle' | 'recording' | 'stopped' | 'error'

export function useMediaRecorder(onSaved: (filePath: string) => void) {
  let mediaStream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let chunks: BlobPart[] = []
  let state: RecorderState = 'idle'

  async function start() {
    if (state === 'recording') return
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 1280, height: 720 } })
      recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9' })
      chunks = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstop = async () => {
        try {
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
        }
      }
      recorder.start()
      state = 'recording'
    } catch (e) {
      console.error(e)
      state = 'error'
    }
  }

  function stop() {
    if (state !== 'recording' || !recorder) return
    recorder.stop()
  }

  async function toggle() {
    if (state === 'recording') stop()
    else await start()
  }

  return { start, stop, toggle, getState: () => state }
}
