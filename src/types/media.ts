export type ImageItem = {
  id: string
  type: 'image'
  path: string
  label: { title: string; price: string }
  durationSec?: number
}

export type VideoItem = {
  id: string
  type: 'video'
  path: string
  overlayAudioPath?: string
  overlayAudioStartSec?: number
  inSec?: number
  outSec?: number
  overlays?: Array<{ id: string; path: string; startSec: number }>
}

export type AudioItem = {
  id: string
  type: 'audio'
  path: string
  inSec?: number
  outSec?: number
}

export type TimelineItem = ImageItem | VideoItem | AudioItem


