'use client'

import { useState, useCallback } from 'react'
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus, Map, Route, MoreHorizontal, Minus, Pencil, ArrowLeft, AlertCircle } from 'lucide-react'

import { TripCardItem } from '@/components/trip/trip-card'
import { NotesSheet } from '@/components/trip/notes-sheet'
import { AddNodeDrawer } from '@/components/trip/add-node-drawer'
import { MapMode } from '@/components/trip/map-mode'
import { TravelMode } from '@/components/trip/travel-mode'
import { MoreOptionsSheet } from '@/components/trip/more-options-sheet'
import { EditCardSheet } from '@/components/trip/edit-card-sheet'
import { TransitPicker } from '@/components/trip/transit-picker'
import { Toast } from '@/components/trip/toast'
import { ImportPage } from '@/components/trip/import-page'
import { LoadingPage } from '@/components/trip/loading-page'

import type { TripCard, TripData, TransitInfo, DayTrip } from '@/types/trip'
import { cn } from '@/lib/utils'

type AppPage = 'import' | 'loading' | 'editor'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''
if (!API_BASE) {
  throw new Error('缺少 NEXT_PUBLIC_API_BASE 环境变量')
}
const UNKNOWN_TIME_SET = new Set(['未知', '待定', '不详', '未定'])

const normalizeExtractedTime = (value: unknown): string => {
  const raw = String(value ?? '').trim()
  if (!raw || UNKNOWN_TIME_SET.has(raw)) return ''

  const hhmm = raw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/)
  if (hhmm) {
    const hour = hhmm[1].padStart(2, '0')
    const minute = hhmm[2]
    return `${hour}:${minute}`
  }

  const range = raw.match(/\b([01]?\d|2[0-3])[:：]([0-5]\d)\s*[-~至]\s*([01]?\d|2[0-3])[:：]([0-5]\d)\b/)
  if (range) return `${range[1].padStart(2, '0')}:${range[2]}`

  return ''
}

const createEmptyTripData = (): TripData => ({
  id: crypto.randomUUID(),
  title: '我的旅行计划',
  days: [{ day: 1, cards: [], transits: {} }],
})

export default function TripPlanner() {
  const [currentPage, setCurrentPage] = useState<AppPage>('import')
  const [uploadedImageCount, setUploadedImageCount] = useState(0)

  const [tripData, setTripData] = useState<TripData>(createEmptyTripData)
  const [currentDay, setCurrentDay] = useState(1)
  const [title, setTitle] = useState(tripData.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const [selectedCard, setSelectedCard] = useState<TripCard | null>(null)
  const [showNotesSheet, setShowNotesSheet] = useState(false)
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [showMapMode, setShowMapMode] = useState(false)
  const [showTravelMode, setShowTravelMode] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showTransitPicker, setShowTransitPicker] = useState(false)

  // 这里存 toCardId（通勤条显示在“当前卡”上方）
  const [selectedTransitToCardId, setSelectedTransitToCardId] = useState<string | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [toast, setToast] = useState({ message: '', visible: false })
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  const currentDayData: DayTrip =
    tripData.days.find((d) => d.day === currentDay) || tripData.days[0]

  const buildDefaultTransits = (cards: TripCard[], oldTransits?: DayTrip['transits']): DayTrip['transits'] => {
    return Object.fromEntries(
      cards.slice(0, -1).map((fromCard, idx) => {
        const toCard = cards[idx + 1]
        const key = `${fromCard.id}_${toCard.id}`
        const old = oldTransits?.[key]
        return [key, old || { mode: '步行' as const, duration: '约15分钟' }]
      }),
    )
  }

  const handleStartGenerate = async (_images: File[], text: string) => {
    try {
      const trimmedText = text.trim()

      if (!trimmedText) {
        alert('当前后端仅支持文本提取，请先粘贴攻略文本内容')
        return
      }

      setUploadedImageCount(trimmedText ? 1 : 0)
      setCurrentPage('loading')

      const res = await fetch(`${API_BASE}/api/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmedText }),
      })

      if (!res.ok) {
        let msg = ''
        try {
          const errorData = await res.json()
          msg = errorData?.detail || errorData?.error || ''
        } catch {
          msg = await res.text().catch(() => '')
        }
        throw new Error(msg || `extract failed: ${res.status}`)
      }

      const data = await res.json()
      if (data?.error) throw new Error(data.error)

      const mappedDays: TripData['days'] = (data?.days || []).map((d: any, dayIndex: number) => {
        const dayNum = d?.day ?? dayIndex + 1
        const items = Array.isArray(d?.items) ? d.items : []

        const cards: TripCard[] = items.map((item: any, idx: number) => {
          const confidenceValue =
            typeof item?.confidence === 'number'
              ? item.confidence
              : item?.confidence === '高'
                ? 0.9
                : item?.confidence === '中'
                  ? 0.7
                  : item?.confidence === '低'
                    ? 0.5
                    : Number(item?.confidence) || 0.7

          return {
            id: `card-${dayNum}-${idx}-${crypto.randomUUID()}`,
            placeName: item?.name || item?.placeName || '未命名地点',
            time: normalizeExtractedTime(item?.time),
            type:
              item?.type === '景点' ||
              item?.type === '美食' ||
              item?.type === '酒店' ||
              item?.type === '购物' ||
              item?.type === '交通'
                ? item.type
                : '景点',
            tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
            tips: item?.tips && item.tips !== '无' ? item.tips : '',
            confidence: confidenceValue,
            address: item?.address || '',
            notes: [],
          } as TripCard
        })

        return {
          day: dayNum,
          cards,
          transits: buildDefaultTransits(cards),
        }
      })

      const finalTripData: TripData = {
        id: crypto.randomUUID(),
        title: data?.title?.trim() || trimmedText.slice(0, 20) || '我的旅行计划',
        days: mappedDays.length > 0 ? mappedDays : [{ day: 1, cards: [], transits: {} }],
      }

      setTripData(finalTripData)
      setTitle(finalTripData.title)
      setCurrentDay(finalTripData.days[0]?.day ?? 1)
      setCurrentPage('editor')
      showToast('生成完成！')
    } catch (e: any) {
      console.error(e)
      setCurrentPage('import')
      alert(`生成失败：${e?.message || '未知错误'}`)
    }
  }

  const handleLoadingComplete = () => setCurrentPage('editor')
  const handleBackToImport = () => setCurrentPage('import')

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      setTripData((prev) => {
        const newDays = prev.days.map((day) => {
          if (day.day !== currentDay) return day

          const oldIndex = day.cards.findIndex((c) => c.id === active.id)
          const newIndex = day.cards.findIndex((c) => c.id === over.id)
          const nextCards = arrayMove(day.cards, oldIndex, newIndex)

          return {
            ...day,
            cards: nextCards,
            transits: buildDefaultTransits(nextCards, day.transits),
          }
        })
        return { ...prev, days: newDays }
      })

      showToast('行程顺序已更新')
    }
  }

  const handleDeleteCard = useCallback((cardId: string) => {
    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        const nextCards = day.cards.filter((c) => c.id !== cardId)
        return {
          ...day,
          cards: nextCards,
          transits: buildDefaultTransits(nextCards, day.transits),
        }
      }),
    }))
    showToast('已删除该节点')
  }, [])

  const handleEditCard = useCallback((card: TripCard) => {
    setSelectedCard(card)
    setShowEditSheet(true)
  }, [])

  const handleSaveCard = useCallback((updatedCard: TripCard) => {
    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        const hasCard = day.cards.some((c) => c.id === updatedCard.id)
        if (!hasCard) return day
        const nextCards = day.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
        return {
          ...day,
          cards: nextCards,
          transits: buildDefaultTransits(nextCards, day.transits),
        }
      }),
    }))
    showToast('修改已保存')
  }, [])

  const handleAddMemo = useCallback((card: TripCard) => {
    setSelectedCard(card)
    setShowEditSheet(true)
  }, [])

  const handleShowNotes = useCallback((card: TripCard) => {
    setSelectedCard(card)
    setShowNotesSheet(true)
  }, [])

  const handleAddNode = useCallback(
    (newCard: Omit<TripCard, 'id' | 'notes'>) => {
      const id = `card-${Date.now()}`
      const appended = { ...(newCard as any), id, notes: [] } as TripCard

      setTripData((prev) => ({
        ...prev,
        days: prev.days.map((day) => {
          if (day.day !== currentDay) return day
          const nextCards = [...day.cards, appended]
          return {
            ...day,
            cards: nextCards,
            transits: buildDefaultTransits(nextCards, day.transits),
          }
        }),
      }))
      showToast('节点已添加')
    },
    [currentDay],
  )

  // 收到的是 toCardId（当前卡）
  const handleTransitClick = useCallback((toCardId: string) => {
    setSelectedTransitToCardId(toCardId)
    setShowTransitPicker(true)
  }, [])

  // 简化：只更新模式，不重算时间
  const handleTransitChange = useCallback(
    (fromCardId: string, mode: TransitInfo['mode']) => {
      setTripData((prev) => ({
        ...prev,
        days: prev.days.map((day) => {
          if (day.day !== currentDay) return day

          const idx = day.cards.findIndex((c) => c.id === fromCardId)
          const toCard = day.cards[idx + 1]
          if (!toCard) return day

          const key = `${fromCardId}_${toCard.id}`
          const existing = day.transits[key]

          return {
            ...day,
            transits: {
              ...day.transits,
              [key]: {
                mode,
                duration: existing?.duration || '约15分钟',
                distance: existing?.distance,
                strategy: existing?.strategy,
              },
            },
          }
        }),
      }))

      setShowTransitPicker(false)
      showToast(`已切换为${mode}`)
    },
    [currentDay],
  )

  const handleOptimizeRoute = useCallback(() => {
    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.day !== currentDay) return day
        const shuffled = [...day.cards].sort(() => Math.random() - 0.5)
        return {
          ...day,
          cards: shuffled,
          transits: buildDefaultTransits(shuffled, day.transits),
        }
      }),
    }))
    showToast('AI已优化路线')
  }, [currentDay])

  // 直接跳高德首页
  const handleNavigateAmapHome = useCallback(() => {
    window.open('https://www.amap.com/', '_blank')
  }, [])

  const handleAddDay = () => {
    const newDay = tripData.days.length + 1
    setTripData((prev) => ({
      ...prev,
      days: [...prev.days, { day: newDay, cards: [], transits: {} }],
    }))
    setCurrentDay(newDay)
    showToast(`已添加 Day ${newDay}`)
  }

  const handleRemoveDay = () => {
    if (tripData.days.length <= 1) return
    const removedDay = tripData.days.length
    setTripData((prev) => ({
      ...prev,
      days: prev.days.filter((d) => d.day !== removedDay),
    }))
    if (currentDay === removedDay) setCurrentDay(removedDay - 1)
    showToast(`已删除 Day ${removedDay}`)
  }

  const handleSaveTrip = () => {
    setShowSaveConfirm(true)
    setTimeout(() => {
      setShowSaveConfirm(false)
      showToast('行程已保存')
    }, 1500)
  }

  const activeCard = activeId ? currentDayData.cards.find((c) => c.id === activeId) : null

  const currentTransitModeForPicker: TransitInfo['mode'] = (() => {
    if (!selectedTransitToCardId) return '步行'
    const toIndex = currentDayData.cards.findIndex((c) => c.id === selectedTransitToCardId)
    if (toIndex <= 0) return '步行'
    const fromCard = currentDayData.cards[toIndex - 1]
    const toCard = currentDayData.cards[toIndex]
    const key = `${fromCard.id}_${toCard.id}`
    return currentDayData.transits[key]?.mode || '步行'
  })()

  const handleTransitPickerSelect = (mode: TransitInfo['mode']) => {
    if (!selectedTransitToCardId) return
    const toIndex = currentDayData.cards.findIndex((c) => c.id === selectedTransitToCardId)
    if (toIndex <= 0) return
    const fromCard = currentDayData.cards[toIndex - 1]
    handleTransitChange(fromCard.id, mode)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-[390px] h-[844px] bg-background rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-8 border-foreground/10">
        <div className="h-11 bg-card flex items-center justify-between px-6 shrink-0">
          <span className="text-xs font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-foreground/50 rounded-sm">
              <div className="w-3 h-1 bg-foreground/50 m-0.5" />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentPage === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-hidden"
            >
              <ImportPage onStartGenerate={handleStartGenerate} />
            </motion.div>
          )}

          {currentPage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden"
            >
              <LoadingPage onComplete={handleLoadingComplete} imageCount={uploadedImageCount} />
            </motion.div>
          )}

          {currentPage === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="bg-card px-4 py-2.5 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToImport}
                      className="p-1.5 -ml-1 rounded-full hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {isEditingTitle ? (
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        autoFocus
                        className="text-base font-semibold bg-transparent border-b-2 border-primary focus:outline-none text-foreground w-32"
                      />
                    ) : (
                      <button onClick={() => setIsEditingTitle(true)} className="flex items-center gap-1.5 group">
                        <h1 className="text-base font-semibold text-foreground">{title}</h1>
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSaveTrip}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 ml-7">来自 {uploadedImageCount || 3} 张截图</p>
              </div>

              <div className="bg-card px-2 py-2.5 border-b border-border shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                  {tripData.days.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setCurrentDay(day.day)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                        currentDay === day.day
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80',
                      )}
                    >
                      Day {day.day}
                    </button>
                  ))}

                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={handleAddDay}
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {tripData.days.length > 1 && (
                      <button
                        onClick={handleRemoveDay}
                        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 px-3 py-2 flex items-center gap-2 border-b border-orange-100">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <p className="text-[10px] text-orange-700">
                  行程信息由AI生成，建议核对关键信息（如营业时间、票价）
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={currentDayData.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {currentDayData.cards.map((card, index) => {
                        const prevCard = currentDayData.cards[index - 1]
                        const transitKey = prevCard ? `${prevCard.id}_${card.id}` : null
                        const transit = transitKey ? currentDayData.transits[transitKey] : undefined

                        return (
                          <motion.div
                            key={card.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <TripCardItem
                              card={card}
                              transit={transit}
                              onDelete={handleDeleteCard}
                              onEdit={handleEditCard}
                              onAddMemo={handleAddMemo}
                              onShowNotes={handleShowNotes}
                              onTransitClick={handleTransitClick}
                              isDragging={activeId === card.id}
                            />
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </SortableContext>

                  <DragOverlay>
                    {activeCard && (
                      <div className="opacity-80">
                        <TripCardItem
                          card={activeCard}
                          onDelete={() => {}}
                          onEdit={() => {}}
                          onAddMemo={() => {}}
                          onShowNotes={() => {}}
                          onTransitClick={() => {}}
                          isDragging
                        />
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>

                {currentDayData.cards.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                      <Map className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">还没有行程安排</p>
                    <button
                      onClick={() => setShowAddDrawer(true)}
                      className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm"
                    >
                      添加第一个节点
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-card border-t border-border p-2.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowAddDrawer(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    添加节点
                  </button>
                  <button
                    onClick={() => setShowMapMode(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-muted text-foreground rounded-xl font-medium text-xs"
                  >
                    <Map className="w-4 h-4" />
                    地图模式
                  </button>
                  <button
                    onClick={() => setShowTravelMode(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-muted text-foreground rounded-xl font-medium text-xs"
                  >
                    <Route className="w-4 h-4" />
                    出行模式
                  </button>
                  <button
                    onClick={() => setShowMoreOptions(true)}
                    className="w-10 h-10 flex items-center justify-center bg-muted text-foreground rounded-xl"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Toast message={toast.message} isVisible={toast.visible} />

              <NotesSheet card={selectedCard} isOpen={showNotesSheet} onClose={() => setShowNotesSheet(false)} />
              <AddNodeDrawer isOpen={showAddDrawer} onClose={() => setShowAddDrawer(false)} onAdd={handleAddNode} />

              <MapMode
                isOpen={showMapMode}
                onClose={() => setShowMapMode(false)}
                dayTrip={currentDayData}
                onOptimizeRoute={handleOptimizeRoute}
                onCardClick={(card) => setSelectedCard(card)}
              />

              <TravelMode
                isOpen={showTravelMode}
                onClose={() => setShowTravelMode(false)}
                tripData={tripData}
                currentDay={currentDay}
                onDayChange={setCurrentDay}
                onTransitChange={handleTransitChange}
                onNavigateAll={handleNavigateAmapHome}
              />

              <MoreOptionsSheet isOpen={showMoreOptions} onClose={() => setShowMoreOptions(false)} />
              <EditCardSheet card={selectedCard} isOpen={showEditSheet} onClose={() => setShowEditSheet(false)} onSave={handleSaveCard} />

              <TransitPicker
                isOpen={showTransitPicker}
                currentMode={currentTransitModeForPicker}
                onClose={() => setShowTransitPicker(false)}
                onSelect={handleTransitPickerSelect}
              />

              <AnimatePresence>
                {showSaveConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-card rounded-2xl p-5 w-full max-w-[240px] shadow-xl text-center"
                    >
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">正在保存...</p>
                      <p className="text-xs text-muted-foreground mt-1">请稍候</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}