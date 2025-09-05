import { useSensor, useSensors, PointerSensor, DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { SortableItem } from './SortableItem'
import type { TimelineItem } from '../types/media'
import type { DragEndEvent } from '@dnd-kit/core'

export function Timeline({ items, onReorder, onSelect, selectedId }: {
  items: TimelineItem[]
  onReorder: (next: TimelineItem[]) => void
  onSelect: (id: string) => void
  selectedId?: string
}) {
  const sensors = useSensors(useSensor(PointerSensor))

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === String(active.id))
    const newIndex = items.findIndex((i) => i.id === String(over.id))
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  function handleDragStart(e: React.DragEvent, item: TimelineItem) {
    if (item.type === 'audio') {
      e.dataTransfer.setData('audio-id', item.path)
      e.dataTransfer.effectAllowed = 'copy'
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((it) => (
            <SortableItem key={it.id} id={it.id}>
              <li
                onClick={() => onSelect(it.id)}
                draggable={it.type === 'audio'}
                onDragStart={(e) => handleDragStart(e, it)}
                style={{
                  padding: 6,
                  border: '1px solid #eee',
                  marginBottom: 6,
                  background: selectedId === it.id ? '#eef6ff' : 'white',
                  cursor: it.type === 'audio' ? 'grab' : 'pointer',
                }}
              >
                {it.type === 'image' && <span>🖼️ {it.path.split('\\').pop()}</span>}
                {it.type === 'audio' && <span>🎵 {it.path.split('\\').pop()}</span>}
                {it.type === 'video' && <span>🎬 {it.path.split('\\').pop()}</span>}
              </li>
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}


