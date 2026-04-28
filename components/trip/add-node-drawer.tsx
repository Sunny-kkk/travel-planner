'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, Clock, Tag, FileText } from 'lucide-react'
import { useState } from 'react'
import type { TripCard } from '@/types/trip'

interface AddNodeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (card: Omit<TripCard, 'id' | 'notes'>) => void
}

const placeTypes = ['景点', '美食', '酒店', '购物', '交通'] as const

const suggestedPlaces = [
  { name: '钟楼', type: '景点' as const },
  { name: '大唐不夜城', type: '景点' as const },
  { name: '袁家村', type: '美食' as const },
  { name: '永兴坊', type: '美食' as const },
  { name: '西安城墙', type: '景点' as const },
]

export function AddNodeDrawer({ isOpen, onClose, onAdd }: AddNodeDrawerProps) {
  const [placeName, setPlaceName] = useState('')
  const [placeType, setPlaceType] = useState<typeof placeTypes[number]>('景点')
  const [time, setTime] = useState('')
  const [memo, setMemo] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = () => {
    if (!placeName.trim()) return

    onAdd({
      placeName: placeName.trim(),
      type: placeType,
      time: time || '待定',
      tags: [],
      memo: memo.trim() || undefined,
    })

    // Reset form
    setPlaceName('')
    setPlaceType('景点')
    setTime('')
    setMemo('')
    onClose()
  }

  const handleSelectSuggestion = (place: typeof suggestedPlaces[0]) => {
    setPlaceName(place.name)
    setPlaceType(place.type)
    setShowSuggestions(false)
  }

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

          {/* Drawer - Full screen within phone container */}
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
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">添加节点</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Place Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  地点名称
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => {
                      setPlaceName(e.target.value)
                      setShowSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => setShowSuggestions(placeName.length > 0)}
                    placeholder="搜索或输入地点名称"
                    className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                </div>

                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
                    >
                      {suggestedPlaces
                        .filter(p => p.name.includes(placeName) || placeName === '')
                        .slice(0, 5)
                        .map((place, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectSuggestion(place)}
                            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-muted text-left"
                          >
                            <span className="text-sm text-foreground">{place.name}</span>
                            <span className="text-[10px] text-muted-foreground">{place.type}</span>
                          </button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  类型
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {placeTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setPlaceType(type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        placeType === type
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  时间（选填）
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Memo */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  备注（选填）
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="添加备注信息..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={handleSubmit}
                disabled={!placeName.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加到行程
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
