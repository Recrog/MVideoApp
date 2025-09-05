import { useEffect, useState } from 'react'
import './App.css'
import { Timeline } from './components/Timeline'
import type { TimelineItem, ImageItem, VideoItem } from './types/media'
import { PreviewPanel } from './components/PreviewPanel'
import { usePreviewRecorder } from './hooks/usePreviewRecorder'

function App() {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  const previewRecorder = usePreviewRecorder(() => items.find((i) => i.id === selectedId), (filePath) => {
    const newItem: TimelineItem = { id: `${Date.now()}`, type: 'video', path: filePath }
    setItems((prev) => [...prev, newItem])
    setSelectedId(newItem.id)
  })

  useEffect(() => {
    const off = window.api?.onToggleRecord?.(() => {
      previewRecorder.toggle()
    })
    return () => off && off()
  }, [previewRecorder])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!items.length) return
      const currentIndex = selectedId ? items.findIndex((i) => i.id === selectedId) : -1
      if (e.key === 'ArrowRight') {
        const nextIndex = Math.min(items.length - 1, currentIndex + 1)
        setSelectedId(items[Math.max(0, nextIndex)].id)
      }
      if (e.key === 'ArrowLeft') {
        const prevIndex = Math.max(0, currentIndex - 1)
        setSelectedId(items[Math.max(0, prevIndex)].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items, selectedId])

  useEffect(() => {
    if (!selectedId && items.length) setSelectedId(items[0].id)
  }, [items, selectedId])

  useEffect(() => {
    function onAttach(e: Event) {
      const detail = (e as CustomEvent).detail as { id: string; path: string }
      setItems((prev) => prev.map((it) => (it.id === detail.id && it.type === 'video' ? { ...(it as VideoItem), overlayAudioPath: detail.path } : it)))
    }
    function onTrim(e: Event) {
      const { id, kind, value } = (e as CustomEvent).detail as { id: string; kind: 'in' | 'out'; value: number }
      setItems((prev) => prev.map((it) => {
        if (it.id !== id) return it
        if (it.type === 'video') {
          const v = it as VideoItem
          return { ...v, [kind === 'in' ? 'inSec' : 'outSec']: Math.max(0, value) }
        }
        return it
      }))
    }
    function onOverlayShift(e: Event) {
      const { id, overlayId, delta } = (e as CustomEvent).detail as { id: string; overlayId: string; delta: number }
      setItems((prev) => prev.map((it) => {
        if (it.id !== id || it.type !== 'video') return it
        const v = it as VideoItem
        const overlays = (v.overlays || []).map((o) => o.id === overlayId ? { ...o, startSec: Math.max(0, (o.startSec || 0) + delta) } : o)
        return { ...v, overlays }
      }))
    }
    function onVideoUpdate(e: Event) {
      const { id, item } = (e as CustomEvent).detail as { id: string; item: VideoItem }
      setItems((prev) => prev.map((it) => (it.id === id ? item : it)))
    }
    window.addEventListener('video:attach-audio' as any, onAttach)
    window.addEventListener('video:trim' as any, onTrim)
    window.addEventListener('video:overlay-shift' as any, onOverlayShift)
    window.addEventListener('video:update' as any, onVideoUpdate)
    return () => {
      window.removeEventListener('video:attach-audio' as any, onAttach)
      window.removeEventListener('video:trim' as any, onTrim)
      window.removeEventListener('video:overlay-shift' as any, onOverlayShift)
      window.removeEventListener('video:update' as any, onVideoUpdate)
    }
  }, [])

  async function addPhotos() {
    const files = await window.api?.openFiles?.([{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }])
    if (!files?.length) return
    const newItems: TimelineItem[] = (files as string[]).map((p: string, i: number) => ({
      id: `${Date.now()}-${i}`,
      type: 'image',
      path: p,
      label: { title: 'Ürün Adı', price: '₺0' },
    }))
    setItems((prev) => {
      const next = [...prev, ...newItems]
      if (!selectedId && next.length) setSelectedId(next[0].id)
      return next
    })
  }

  async function addAudio() {
    const files = await window.api?.openFiles?.([{ name: 'Audio', extensions: ['mp3', 'wav'] }])
    if (!files?.length) return
    setItems((prev) => [...prev, { id: `${Date.now()}`, type: 'audio', path: files[0] }])
  }

  function onReorder(next: TimelineItem[]) {
    setItems(next)
  }

  const selectedItem = items.find((i) => i.id === selectedId)

  function updateActiveImage(next: ImageItem) {
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)))
  }

  function goPrev() {
    if (!selectedId || !items.length) return
    const idx = items.findIndex((i) => i.id === selectedId)
    const nextIdx = Math.max(0, idx - 1)
    setSelectedId(items[nextIdx].id)
  }

  function goNext() {
    if (!selectedId || !items.length) return
    const idx = items.findIndex((i) => i.id === selectedId)
    const nextIdx = Math.min(items.length - 1, idx + 1)
    setSelectedId(items[nextIdx].id)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Ürün Tanıtım Editörü</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={addPhotos}>Fotoğraf Ekle</button>
        <button onClick={addAudio}>Ses Ekle</button>
        <button onClick={async () => {
          const path = await window.api?.exportTimeline?.(items)
          if (path) alert(`Export tamam: ${path}`)
        }}>Export MP4</button>
        <button onClick={() => previewRecorder.toggle()}>F4: Önizlemeyi Kaydet</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
        <aside style={{ borderRight: '1px solid #ddd', paddingRight: 12 }}>
          <h3>Timeline</h3>
          <Timeline items={items} onReorder={onReorder} onSelect={setSelectedId} selectedId={selectedId} />
          <p style={{ fontSize: 12, opacity: 0.7 }}>Ses dosyasını video seçiliyken sağdaki bara sürüklemek için: Ses ekleyin, sonra sağda Ses Ekle/Bağla ile veya MVP: (+/-) butonlarıyla hizalayın.</p>
        </aside>
        <main>
          <PreviewPanel item={selectedItem} onUpdateImage={updateActiveImage} onPrev={goPrev} onNext={goNext} />
          <canvas id="preview-record-canvas" width={1280} height={720} style={{ display: 'none' }} />
        </main>
      </div>
    </div>
  )
}

export default App
