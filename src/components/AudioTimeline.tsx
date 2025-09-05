import { useRef, useState } from 'react'
import type { VideoItem } from '../types/media'

export function AudioTimeline({ 
  item, 
  onUpdate 
}: { 
  item: VideoItem
  onUpdate: (next: VideoItem) => void 
}) {
  const [dragOver, setDragOver] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  
  const duration = Math.max(1, Number(item.outSec || 0) - Number(item.inSec || 0)) || 10
  const overlays = item.overlays || []

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const audioId = e.dataTransfer.getData('audio-id')
    if (audioId && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const startSec = (x / rect.width) * duration
      const newOverlay = { id: `${Date.now()}`, path: audioId, startSec: Math.max(0, startSec) }
      onUpdate({ ...item, overlays: [...overlays, newOverlay] })
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function removeOverlay(id: string) {
    onUpdate({ ...item, overlays: overlays.filter(o => o.id !== id) })
  }

  function shiftOverlay(id: string, delta: number) {
    onUpdate({
      ...item,
      overlays: overlays.map(o => 
        o.id === id ? { ...o, startSec: Math.max(0, (o.startSec || 0) + delta) } : o
      )
    })
  }

  return (
    <div style={{ width: 960 }}>
      <div 
        ref={timelineRef}
        style={{ 
          height: 60, 
          border: '2px dashed #ccc', 
          position: 'relative', 
          background: dragOver ? '#e3f2fd' : '#f8f8f8',
          borderRadius: 4,
          transition: 'background 0.2s'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {overlays.map((o) => (
          <div 
            key={o.id}
            draggable
            onDragStart={(e) => {
              setDraggingId(o.id)
              e.dataTransfer.setData('overlay-id', o.id)
            }}
            onDragEnd={() => setDraggingId(null)}
            style={{ 
              position: 'absolute', 
              left: `${(o.startSec / duration) * 100}%`, 
              top: 8, 
              height: 44, 
              width: 120, 
              background: draggingId === o.id ? '#90caf9' : '#2196f3', 
              border: '1px solid #1976d2', 
              borderRadius: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '0 6px',
              cursor: 'grab',
              userSelect: 'none'
            }}
          >
            <span style={{ fontSize: 12, color: '#fff' }}>{o.path.split('\\').pop()}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              <button 
                onClick={() => shiftOverlay(o.id, -1)} 
                style={{ fontSize: 10, padding: '2px 4px' }}
              >
                -1s
              </button>
              <button 
                onClick={() => shiftOverlay(o.id, 1)} 
                style={{ fontSize: 10, padding: '2px 4px' }}
              >
                +1s
              </button>
              <button 
                onClick={() => removeOverlay(o.id)} 
                style={{ fontSize: 10, padding: '2px 4px', background: '#f44336', color: '#fff' }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {dragOver && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            color: '#1976d2',
            fontWeight: 'bold'
          }}>
            Ses dosyasını buraya bırakın
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        <span>0s</span>
        <span>{duration}s</span>
      </div>
    </div>
  )
}
