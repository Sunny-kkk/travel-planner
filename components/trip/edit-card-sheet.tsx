'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Tag, FileText, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { TripCard } from '@/types/trip'

interface EditCardSheetProps {
  card: TripCard | null
  isOpen: boolean
  onClose: () => void
  onSave: (card: TripCard) => void
}

const placeTypes = ['景点', '美食', '酒店', '购物', '交通'] as const

export function EditCardSheet({ card, isOpen, onClose, onSave }: EditCardSheetProps) {
  const [placeName, setPlaceName] = useState('')
  const [placeType, setPlaceType] = useState<typeof placeTypes[number]>('景点')
  const [time, setTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [address, setAddress] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [tips, setTips] = useState('')
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (card) {
      setPlaceName(card.placeName)
      setPlaceType(card.type)
      setTime(card.time)
      setEndTime(card.endTime || '')
      setAddress(card.address || '')
      setOpenTime(card.openTime || '')
      setTips(card.tips || '')
      setMemo(card.memo || '')
    }
  }, [card])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (!card || !placeName.trim()) return

    setIsSaving(true)
    
    setTimeout(() => {
      onSave({
        ...card,
        placeName: placeName.trim(),
        type: placeType,
        time,
        endTime: endTime || undefined,
        address: address.trim() || undefined,
        openTime: openTime.trim() || undefined,
        tips: tips.trim() || undefined,
        memo: memo.trim() || undefined,
      })
      setIsSaving(false)
      onClose()
    }, 500)
  }

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

          {/* Sheet - 占据全屏，顶部保留安全区域 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-0 bg-card rounded-t-2xl sm:rounded-t-3xl z-50 flex flex-col max-h-full"
            style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}
          >
            {/* 顶部把手区域 */}
            <div className="flex justify-center pt-2 pb-1 shrink-0">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* 固定头部 */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-card">
              <h3 className="font-semibold text-sm text-foreground">编辑节点</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 可滚动表单区域 - 自动占满剩余空间 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Place Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  地点名称
                </label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
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
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    开始时间
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    结束时间
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  详细地址
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="输入详细地址"
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Open Time */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  营业时间
                </label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  placeholder="如：08:00-18:00"
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Tips */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                  避坑提醒
                </label>
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="添加避坑提醒..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Memo */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  备注
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="添加备注信息..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            {/* 固定底部按钮区域 - 适配安全区域 */}
            <div className="p-3 border-t border-border shrink-0 bg-card pb-[calc(12px+env(safe-area-inset-bottom))]">
              <button
                onClick={handleSave}
                disabled={!placeName.trim() || isSaving}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存修改'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}