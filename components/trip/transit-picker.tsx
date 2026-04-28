'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, Bus, Footprints, Bike, Train } from 'lucide-react'
import type { TransitInfo } from '@/types/trip'
import { cn } from '@/lib/utils'

interface TransitPickerProps {
  isOpen: boolean
  currentMode: TransitInfo['mode']
  onClose: () => void
  onSelect: (mode: TransitInfo['mode']) => void
}

const transitModes: { id: TransitInfo['mode']; label: string; icon: React.ElementType; description: string }[] = [
  { id: '步行', label: '步行', icon: Footprints, description: '适合短距离' },
  { id: '公交', label: '公交', icon: Bus, description: '经济实惠' },
  { id: '地铁', label: '地铁', icon: Train, description: '快速准时' },
  { id: '自驾', label: '自驾', icon: Car, description: '灵活自由' },
  { id: '骑行', label: '骑行', icon: Bike, description: '环保低碳' },
  { id: '打车', label: '打车', icon: Car, description: '方便快捷' },
]

export function TransitPicker({ isOpen, currentMode, onClose, onSelect }: TransitPickerProps) {
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

          {/* Sheet - Positioned within phone container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">选择出行方式</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Options */}
            <div className="p-3 grid grid-cols-3 gap-2 overflow-y-auto">
              {transitModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onSelect(mode.id)
                    onClose()
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                    currentMode === mode.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <mode.icon className={cn(
                    "w-6 h-6",
                    currentMode === mode.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium text-xs",
                    currentMode === mode.id ? "text-primary" : "text-foreground"
                  )}>
                    {mode.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center">
                    {mode.description}
                  </span>
                </button>
              ))}
            </div>

            {/* Cancel */}
            <div className="p-3 pt-0 shrink-0 bg-card pb-[calc(12px+env(safe-area-inset-bottom))]">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-muted text-muted-foreground rounded-xl font-medium text-sm"
              >
                取消
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
