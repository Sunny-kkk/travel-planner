'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Share2, Copy, MessageCircle, Download } from 'lucide-react'

interface MoreOptionsSheetProps {
  isOpen: boolean
  onClose: () => void
}

const options = [
  {
    icon: Users,
    label: '邀请好友共同编辑',
    description: '邀请好友一起规划行程',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Share2,
    label: '分享为笔记',
    description: '将行程分享到小红书',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Copy,
    label: '复制行程链接',
    description: '复制链接分享给好友',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: MessageCircle,
    label: '发送到微信',
    description: '通过微信分享行程',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Download,
    label: '导出为图片',
    description: '生成精美的行程图片',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
]

export function MoreOptionsSheet({ isOpen, onClose }: MoreOptionsSheetProps) {
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
            className="absolute inset-x-0 bottom-0 top-11 bg-card rounded-t-2xl z-50 flex flex-col max-h-[calc(100%-44px)] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">更多选项</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Options */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {options.map((option, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${option.bgColor} flex items-center justify-center shrink-0`}>
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="p-3 pt-0 shrink-0 bg-card pb-[calc(12px+env(safe-area-inset-bottom))]">
              <button
                onClick={onClose}
                className="w-full py-3 bg-muted text-muted-foreground rounded-xl font-medium text-sm"
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
