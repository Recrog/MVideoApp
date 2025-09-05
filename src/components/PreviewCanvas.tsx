import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from 'react-konva'
import useImage from 'use-image'
import type { ImageItem } from '../types/media'

function LabeledImage({ item, width, height, onUpdate }: { item: ImageItem; width: number; height: number; onUpdate: (next: ImageItem) => void }) {
  const src = encodeURI(`file:///${item.path.replace(/\\/g, '/')}`)
  const [img] = useImage(src, 'anonymous')
  const labelWidth = 260
  const labelHeight = 90

  // Fit image into the stage while preserving aspect ratio
  const iw = img?.width ?? 1
  const ih = img?.height ?? 1
  const scale = Math.min(width / iw, height / ih)
  const drawW = iw * scale
  const drawH = ih * scale
  const offsetX = (width - drawW) / 2
  const offsetY = (height - drawH) / 2

  return (
    <Group>
      <Rect width={width} height={height} fill="#000" />
      {img && <KonvaImage image={img} x={offsetX} y={offsetY} width={drawW} height={drawH} />}
      <Group x={width - labelWidth - 24} y={height - labelHeight - 24} draggable>
        <Rect width={labelWidth} height={labelHeight} fill="#000000AA" cornerRadius={12} />
        <Text text={item.label.title} fontSize={22} fill="#fff" x={12} y={12} draggable
          onDragEnd={(e) => e.target.position({ x: 12, y: 12 })}
          onDblClick={() => {
            const t = prompt('Ürün Adı', item.label.title) ?? item.label.title
            onUpdate({ ...item, label: { ...item.label, title: t } })
          }}
        />
        <Text text={item.label.price} fontSize={26} fill="#7CFC00" x={12} y={44} fontStyle="bold" draggable
          onDragEnd={(e) => e.target.position({ x: 12, y: 44 })}
          onDblClick={() => {
            const p = prompt('Fiyat', item.label.price) ?? item.label.price
            onUpdate({ ...item, label: { ...item.label, price: p } })
          }}
        />
      </Group>
    </Group>
  )
}

export function PreviewCanvas({ active, onUpdate }: { active?: ImageItem; onUpdate: (next: ImageItem) => void }) {
  const width = 960
  const height = 540
  return (
    <div style={{ border: '1px solid #ddd', width, height }}>
      <Stage width={width} height={height}>
        <Layer>
          {active && <LabeledImage item={active} width={width} height={height} onUpdate={onUpdate} />}
        </Layer>
      </Stage>
    </div>
  )
}


