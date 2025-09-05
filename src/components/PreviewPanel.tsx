import type { AudioItem, ImageItem, TimelineItem, VideoItem } from '../types/media'
import { PreviewCanvas } from './PreviewCanvas'
import { AudioTimeline } from './AudioTimeline'

export function PreviewPanel({
  item,
  onUpdateImage,
  onPrev,
  onNext,
}: {
  item?: TimelineItem
  onUpdateImage: (next: ImageItem) => void
  onPrev: () => void
  onNext: () => void
}) {
  function updateVideo(next: VideoItem) {
    window.dispatchEvent(new CustomEvent('video:update', { detail: { id: next.id, item: next } }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onPrev}>{'←'} Geri</button>
        <div style={{ flex: 1, textAlign: 'center', opacity: 0.8 }}>
          {item ? (item.type === 'image' ? 'Fotoğraf' : item.type === 'video' ? 'Video' : 'Ses') : 'Seçim yok'}
        </div>
        <button onClick={onNext}>İleri {'→'}</button>
      </div>
      <div style={{ border: '1px solid #ddd', minHeight: 540, display: 'grid', placeItems: 'center', padding: 8 }}>
        {!item && <span>Öğe seçin</span>}
        {item?.type === 'image' && (
          <PreviewCanvas active={item as ImageItem} onUpdate={onUpdateImage} />
        )}
        {item?.type === 'video' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <VideoPreview item={item as VideoItem} />
            <AudioTimeline item={item as VideoItem} onUpdate={updateVideo} />
          </div>
        )}
        {item?.type === 'audio' && (
          <AudioPreview item={item as AudioItem} />
        )}
      </div>
      {item?.type === 'image' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ display: 'grid' }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Ürün Adı</span>
            <input
              value={(item as ImageItem).label.title}
              onChange={(e) => onUpdateImage({ ...(item as ImageItem), label: { ...(item as ImageItem).label, title: e.target.value } })}
            />
          </label>
          <label style={{ display: 'grid' }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Fiyat</span>
            <input
              value={(item as ImageItem).label.price}
              onChange={(e) => onUpdateImage({ ...(item as ImageItem), label: { ...(item as ImageItem).label, price: e.target.value } })}
            />
          </label>
          <label style={{ display: 'grid' }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Süre (sn)</span>
            <input
              type="number"
              min={1}
              value={(item as ImageItem).durationSec ?? 3}
              onChange={(e) => onUpdateImage({ ...(item as ImageItem), durationSec: Math.max(1, Number(e.target.value) || 3) })}
            />
          </label>
        </div>
      )}
      {item?.type === 'video' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ display: 'grid' }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Video Üstü Ses (opsiyonel)</span>
            <AttachAudioButton item={item as VideoItem} />
          </label>
          <label style={{ display: 'grid' }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Giriş (sn)</span>
            <input
              type="number"
              min={0}
              value={(item as VideoItem).inSec ?? 0}
              onChange={(e) => dispatchTrim('in', (item as VideoItem).id, Number(e.target.value) || 0)}
            />
          </label>
          <label style={{ display: 'grid' }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Çıkış (sn)</span>
            <input
              type="number"
              min={0}
              value={(item as VideoItem).outSec ?? 0}
              onChange={(e) => dispatchTrim('out', (item as VideoItem).id, Number(e.target.value) || 0)}
            />
          </label>
        </div>
      )}
    </div>
  )
}

function VideoPreview({ item }: { item: VideoItem }) {
  const src = encodeURI(`file:///${item.path.replace(/\\/g, '/')}`)
  return (
    <div style={{ display: 'grid', gap: 8, placeItems: 'center' }}>
      <video key={src} src={src} controls style={{ width: 960, height: 540, background: 'black' }} />
      {item.overlayAudioPath && (
        <div style={{ fontSize: 12, opacity: 0.7 }}>Üst ses bağlı: {item.overlayAudioPath.split('\\').pop()}</div>
      )}
    </div>
  )
}

function AudioPreview({ item }: { item: AudioItem }) {
  const src = encodeURI(`file:///${item.path.replace(/\\/g, '/')}`)
  return (
    <div style={{ display: 'grid', placeItems: 'center', width: 960, height: 120 }}>
      <audio key={src} src={src} controls style={{ width: 720 }} />
    </div>
  )
}

function AttachAudioButton({ item }: { item: VideoItem }) {
  async function chooseAudio() {
    const files = await window.api?.openFiles?.([{ name: 'Audio', extensions: ['mp3', 'wav'] }])
    if (!files?.length) return
    window.dispatchEvent(new CustomEvent('video:attach-audio', { detail: { id: item.id, path: files[0] } }))
  }
  return <button onClick={chooseAudio}>Ses Ekle/Bağla</button>
}

function dispatchTrim(kind: 'in' | 'out', id: string, value: number) {
  window.dispatchEvent(new CustomEvent('video:trim', { detail: { id, kind, value } }))
}


