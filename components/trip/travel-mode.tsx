'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Navigation,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Car,
  Bus,
  Footprints,
  Bike,
  Train,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import type { TripData, TripCard, TransitInfo } from '@/types/trip'
import { cn } from '@/lib/utils'

interface TravelModeProps {
  isOpen: boolean
  onClose: () => void
  tripData: TripData
  currentDay: number
  onDayChange: (day: number) => void
  onTransitChange: (fromCardId: string, mode: TransitInfo['mode']) => void
  onNavigateAll: () => void
}

const transitModes: { id: TransitInfo['mode']; label: string; icon: React.ElementType }[] = [
  { id: '步行', label: '步行', icon: Footprints },
  { id: '公交', label: '公交', icon: Bus },
  { id: '地铁', label: '地铁', icon: Train },
  { id: '自驾', label: '自驾', icon: Car },
  { id: '骑行', label: '骑行', icon: Bike },
  { id: '打车', label: '打车', icon: Car },
]

const displayTime = (time?: string) => (time?.trim() ? time : '待补充时间')

function TravelCard({
  card,
  index,
  transit,
  nextCardId,
  onTransitChange,
  onNavigateAll,
  isLast,
}: {
  card: TripCard
  index: number
  transit?: TransitInfo
  nextCardId?: string
  onTransitChange: (fromCardId: string, mode: TransitInfo['mode']) => void
  onNavigateAll: () => void
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [showTransitPicker, setShowTransitPicker] = useState(false)

  return (
    <div className="relative">
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-xs">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-foreground">{displayTime(card.time)}</span>
                {card.endTime && (
                  <>
                    <span className="text-muted-foreground text-xs">-</span>
                    <span className="text-xs text-muted-foreground">{card.endTime}</span>
                  </>
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground mt-0.5">{card.placeName}</h3>
            </div>
          </div>

          <div className="flex gap-1.5 mt-2.5">
            <button
              onClick={onNavigateAll}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-[10px] flex items-center justify-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              一键导航
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium text-[10px] flex items-center justify-center gap-1"
            >
              <Info className="w-3 h-3" />
              查看详情
              {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-2.5 pb-2.5 pt-1.5 border-t border-border space-y-1.5">
                {card.address && (
                  <div className="flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-[10px] text-muted-foreground">{card.address}</span>
                  </div>
                )}
                {card.openTime && (
                  <div className="flex items-start gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-[10px] text-muted-foreground">营业时间：{card.openTime}</span>
                  </div>
                )}
                {card.tips && (
                  <div className="p-1.5 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-[10px] text-orange-700">避坑提醒：{card.tips}</p>
                  </div>
                )}
                {card.memo && (
                  <div className="p-1.5 bg-muted rounded-lg">
                    <p className="text-[10px] text-muted-foreground">备注：{card.memo}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isLast && (
        <div className="relative ml-3.5 py-2">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
          <button
            onClick={() => setShowTransitPicker(!showTransitPicker)}
            className="ml-2.5 flex flex-wrap items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg text-[10px] text-muted-foreground hover:bg-muted transition-colors"
          >
            {transit && transitModes.find((m) => m.id === transit.mode)?.icon && (
              (() => {
                const Icon = transitModes.find((m) => m.id === transit.mode)!.icon
                return <Icon className="w-3 h-3" />
              })()
            )}
            <span>{transit?.mode || '步行'}</span>
            <span>·</span>
            <span>{transit?.duration || '约15分钟'}</span>
            <ChevronDown className={cn('w-2 h-2 transition-transform', showTransitPicker && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showTransitPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="ml-2.5 mt-1 p-1 bg-card border border-border rounded-xl shadow-lg"
              >
                <div className="grid grid-cols-3 gap-1">
                  {transitModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        if (nextCardId) onTransitChange(card.id, mode.id)
                        setShowTransitPicker(false)
                      }}
                      className={cn(
                        'flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors',
                        transit?.mode === mode.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                      )}
                    >
                      <mode.icon className="w-3.5 h-3.5" />
                      <span className="text-[9px]">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export function TravelMode({
  isOpen,
  onClose,
  tripData,
  currentDay,
  onDayChange,
  onTransitChange,
  onNavigateAll,
}: TravelModeProps) {
  const dayTrip = tripData.days.find((d) => d.day === currentDay) || tripData.days[0]

  const totalNodes = dayTrip.cards.length
  const transits = Object.values(dayTrip.transits)
  const totalDuration = transits.reduce((acc, t) => {
    const match = t.duration.match(/(\d+)/)
    return acc + (match ? Number(match[1]) : 0)
  }, 0)

  const handlePrevDay = () => {
    if (currentDay > 1) onDayChange(currentDay - 1)
  }

  const handleNextDay = () => {
    if (currentDay < tripData.days.length) onDayChange(currentDay + 1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute inset-0 bg-background z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border shrink-0">
            <button onClick={onClose} className="p-1 -ml-1">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={handlePrevDay} disabled={currentDay <= 1} className="p-1 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <h2 className="font-semibold text-xs text-foreground min-w-[100px] text-center">
                Day {currentDay} 行程详情
              </h2>
              <button
                onClick={handleNextDay}
                disabled={currentDay >= tripData.days.length}
                className="p-1 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <button className="flex items-center gap-0.5 text-primary text-[10px] font-medium">
              <Download className="w-3 h-3" />
              离线
            </button>
          </div>

          <div className="bg-card border-b border-border px-4 py-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{totalNodes}</p>
                <p className="text-[9px] text-muted-foreground">目的地</p>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{totalDuration}</p>
                <p className="text-[9px] text-muted-foreground">通勤(分钟)</p>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {dayTrip.cards[dayTrip.cards.length - 1]?.endTime || '--:--'}
                </p>
                <p className="text-[9px] text-muted-foreground">预计结束</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-0 min-h-0">
            {dayTrip.cards.map((card, index) => {
              const nextCard = dayTrip.cards[index + 1]
              const transitKey = `${card.id}_${nextCard?.id}`
              const transit = dayTrip.transits[transitKey]

              return (
                <TravelCard
                  key={card.id}
                  card={card}
                  index={index}
                  transit={transit}
                  nextCardId={nextCard?.id}
                  onTransitChange={onTransitChange}
                  onNavigateAll={onNavigateAll}
                  isLast={index === dayTrip.cards.length - 1}
                />
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}