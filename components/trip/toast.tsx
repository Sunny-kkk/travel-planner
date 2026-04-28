'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface ToastProps {
  message: string
  isVisible: boolean
}

export function Toast({ message, isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-28 left-4 right-4 bg-foreground text-background rounded-xl p-4 shadow-lg z-40 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
          <p className="text-sm leading-relaxed">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
