'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import type { TripCard } from '@/types/trip'
import Image from 'next/image'

interface NotesSheetProps {
  card: TripCard | null
  isOpen: boolean
  onClose: () => void
}

export function NotesSheet({ card, isOpen, onClose }: NotesSheetProps) {
  if (!card) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Sheet - Full screen within phone container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-11 bg-card rounded-t-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{card.placeName}</h3>
                <p className="text-xs text-muted-foreground">相关笔记 ({card.notes.length})</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {card.notes.map((note) => (
                <div key={note.id} className="bg-secondary/30 rounded-xl p-3">
                  {/* Author */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={note.authorAvatar}
                        alt={note.authorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-sm text-foreground">{note.authorName}</span>
                  </div>

                  {/* Content with Thumbnail */}
                  <div className="flex gap-2.5">
                    <p className="flex-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {note.content}
                    </p>
                    {note.thumbnail && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <Image
                          src={note.thumbnail}
                          alt="笔记配图"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* View Full Note Button */}
                  <button className="flex items-center gap-1 mt-2.5 text-primary text-xs font-medium">
                    <span>查看完整笔记</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
