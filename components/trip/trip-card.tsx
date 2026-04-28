'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useState, useRef } from 'react'
import { MapPin, Clock, GripVertical, Trash2, Pencil, MessageSquarePlus, ChevronRight } from 'lucide-react'
import type { TripCard, TransitInfo } from '@/types/trip'
import { cn } from '@/lib/utils'

interface TripCardProps {
  card: TripCard
  transit?: TransitInfo
  transitFromCardId?: string
  onDelete: (id: string) => void
  onEdit: (card: TripCard) => void
  onAddMemo: (card: TripCard) => void
  onShowNotes: (card: TripCard) => void
  onTransitClick: (fromCardId: string) => void
  isDragging?: boolean
}

const typeColors: Record<string, { bg: string; text: string }> = {
  景点: { bg: 'bg-primary/10', text: 'text-primary' },
  美食: { bg: 'bg-orange-100', text: 'text-orange-600' },
  酒店: { bg: 'bg-blue-100', text: 'text-blue-600' },
  购物: { bg: 'bg-pink-100', text: 'text-pink-600' },
  交通: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

const transitIcons: Record<string, string> = {
  步行: '🚶',
  公交: '🚌',
  地铁: '🚇',
  自驾: '🚗',
  骑行: '🚴',
  打车: '🚕',
}

export function TripCardItem({
  card,
  transit,
  transitFromCardId,
  onDelete,
  onEdit,
  onAddMemo,
  onShowNotes,
  onTransitClick,
  isDragging,
}: TripCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const x = useMotionValue(0)
  const actionsOpacity = useTransform(x, [-120, -60], [1, 0])
  const actionsX = useTransform(x, [-120, 0], [0, 120])

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) setShowActions(true)
    else setShowActions(false)
  }

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => setIsLongPressing(true), 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    setTimeout(() => setIsLongPressing(false), 100)
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {transit && transitFromCardId && (
        <button
          onClick={() => onTransitClick(transitFromCardId)}
          className="flex items-center gap-2 py-2 px-4 ml-6 text-sm text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="w-px h-4 bg-border" />
          <span className="text-lg">{transitIcons[transit.mode]}</span>
          <span>{transit.mode}</span>
          <span className="text-xs">·</span>
          <span>{transit.duration}</span>
          {transit.distance && (
            <>
              <span className="text-xs">·</span>
              <span>{transit.distance}</span>
            </>
          )}
          <ChevronRight className="w-3 h-3 ml-auto" />
        </button>
      )}

      <div className="relative overflow-hidden rounded-2xl">
        <motion.div className="absolute right-0 top-0 bottom-0 flex items-stretch z-10" style={{ opacity: actionsOpacity, x: actionsX }}>
          <button onClick={() => onAddMemo(card)} className="w-16 bg-accent flex items-center justify-center text-accent-foreground">
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <button onClick={() => onEdit(card)} className="w-16 bg-blue-500 flex items-center justify-center text-white">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(card.id)} className="w-16 bg-destructive flex items-center justify-center text-destructive-foreground">
            <Trash2 className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div
          className={cn('bg-card rounded-2xl shadow-sm border border-border p-4 relative', isDragging && 'shadow-xl scale-[1.02] z-50', isLongPressing && 'ring-2 ring-primary shadow-lg')}
          drag="x"
          dragConstraints={{ left: -160, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          animate={{ x: showActions ? -160 : 0 }}
        >
          <div className="flex gap-3">
            <div
              className="flex flex-col items-center pt-1 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
              onMouseDown={handleLongPressStart}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={handleLongPressStart}
              onTouchEnd={handleLongPressEnd}
            >
              <GripVertical className="w-5 h-5 text-muted-foreground/50" />
            </div>

            <div className="flex flex-col items-center min-w-[50px]">
              <span className="text-lg font-semibold text-foreground">{card.time || '待补充'}</span>
              {card.endTime && (
                <>
                  <div className="w-px h-3 bg-border my-1" />
                  <span className="text-xs text-muted-foreground">{card.endTime}</span>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground text-base truncate">{card.placeName}</h3>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium shrink-0', typeColors[card.type]?.bg, typeColors[card.type]?.text)}>
                  {card.type}
                </span>
              </div>
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {card.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              )}
              {card.address && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{card.address}</span>
                </div>
              )}
              {card.openTime && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{card.openTime}</span>
                </div>
              )}
              {card.notes.length > 0 && (
                <button onClick={() => onShowNotes(card)} className="flex items-center gap-1 mt-3 text-xs text-primary hover:underline">
                  <span>来自{card.notes.length}篇笔记</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {card.memo && <div className="mt-2 p-2 bg-secondary/50 rounded-lg text-xs text-muted-foreground">📝 {card.memo}</div>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}