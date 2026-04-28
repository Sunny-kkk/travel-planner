'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, MapPin, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { TripCard, DayTrip } from '@/types/trip'
import { cn } from '@/lib/utils'

interface MapModeProps {
  isOpen: boolean
  onClose: () => void
  dayTrip: DayTrip
  onOptimizeRoute: () => void
  onCardClick: (card: TripCard) => void
}

type Point = { x: number; y: number }

const getNodePositions = (count: number): Point[] => {
  if (count <= 0) return []
  if (count === 1) return [{ x: 195, y: 90 }]

  const cols = [75, 165, 255, 335]
  const startY = 90
  const stepY = 70

  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols.length)
    const colIndex = i % cols.length
    const serpentine = row % 2 === 0 ? colIndex : cols.length - 1 - colIndex
    return {
      x: cols[serpentine],
      y: startY + row * stepY,
    }
  })
}

export function MapMode({ isOpen, onClose, dayTrip, onOptimizeRoute, onCardClick }: MapModeProps) {
  const [selectedCard, setSelectedCard] = useState<TripCard | null>(null)
  const [showOptimizeConfirm, setShowOptimizeConfirm] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const positions = useMemo(() => getNodePositions(dayTrip.cards.length), [dayTrip.cards.length])

  const routePath = useMemo(() => {
    if (positions.length < 2) return ''
    const [first, ...rest] = positions
    return `M ${first.x},${first.y} ` + rest.map((p) => `L ${p.x},${p.y}`).join(' ')
  }, [positions])

  const handleCardClick = (card: TripCard) => {
    setSelectedCard(card)
    onCardClick(card)
  }

  const handleOptimize = () => {
    setIsOptimizing(true)
    setTimeout(() => {
      setIsOptimizing(false)
      setShowOptimizeConfirm(false)
      onOptimizeRoute()
    }, 1200)
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
          <div className="flex items-center justify-between px-3 py-2.5 bg-card border-b border-border shrink-0">
            <button onClick={onClose} className="p-1.5 -ml-1">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h2 className="font-semibold text-xs text-foreground">Day {dayTrip.day} 路线地图</h2>
            <div className="w-8" />
          </div>

          <div className="flex-1 relative bg-blue-50 overflow-hidden min-h-0">
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-100 opacity-50" />

              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 500" preserveAspectRatio="none">
                {routePath && (
                  <path
                    d={routePath}
                    fill="none"
                    stroke="#E54D42"
                    strokeWidth="2.5"
                    strokeDasharray="6,3"
                    className="opacity-70"
                  />
                )}

                {dayTrip.cards.map((card, index) => {
                  const pos = positions[index] || { x: 195, y: 250 }
                  const nextPos = positions[index + 1]
                  const nextCard = dayTrip.cards[index + 1]
                  const transit = nextCard ? dayTrip.transits[`${card.id}_${nextCard.id}`] : undefined

                  return (
                    <g key={card.id}>
                      {nextPos && (
                        <g>
                          <rect
                            x={(pos.x + nextPos.x) / 2 - 42}
                            y={(pos.y + nextPos.y) / 2 - 11}
                            width="84"
                            height="22"
                            rx="11"
                            fill="white"
                            stroke="#E5E5E5"
                            strokeWidth="1"
                          />
                          <text
                            x={(pos.x + nextPos.x) / 2}
                            y={(pos.y + nextPos.y) / 2 + 4}
                            textAnchor="middle"
                            className="fill-gray-600"
                            fontSize="9"
                          >
                            {transit?.duration || '约15分钟'}
                          </text>
                        </g>
                      )}

                      <g onClick={() => handleCardClick(card)} className="cursor-pointer">
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="18"
                          className={cn(
                            'fill-primary transition-all',
                            selectedCard?.id === card.id && 'fill-primary scale-110',
                          )}
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          className="fill-white font-bold"
                          fontSize="11"
                        >
                          {index + 1}
                        </text>
                      </g>
                    </g>
                  )
                })}
              </svg>
            </div>

            <AnimatePresence>
              {selectedCard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-16 left-3 right-3 bg-card rounded-xl shadow-lg p-2.5 border border-border max-h-[40vh] overflow-y-auto"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-foreground">{selectedCard.placeName}</h4>
                      <p className="text-[10px] text-muted-foreground">{selectedCard.time || '待补充时间'}</p>
                      {selectedCard.address && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 break-words">
                          {selectedCard.address}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setSelectedCard(null)} className="text-muted-foreground p-1 shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-card border-t border-border p-2.5 shrink-0">
            <button
              onClick={() => setShowOptimizeConfirm(true)}
              className="w-full py-2.5 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI一键优化路线
            </button>
          </div>

          <AnimatePresence>
            {showOptimizeConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 z-60 flex items-center justify-center p-3"
                onClick={() => !isOptimizing && setShowOptimizeConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card rounded-2xl w-full max-w-[280px] overflow-hidden shadow-xl"
                >
                  <div className="p-4">
                    {isOptimizing ? (
                      <div className="text-center py-4">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <p className="text-xs text-foreground font-medium">AI正在优化路线...</p>
                        <p className="text-[10px] text-muted-foreground mt-1">正在重排行程节点</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-3">
                          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground">AI智能优化</h3>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            按顺路不绕路原则重排行程
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowOptimizeConfirm(false)}
                            className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-medium"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleOptimize}
                            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
                          >
                            开始优化
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}