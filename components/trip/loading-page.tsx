'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface LoadingPageProps {
  onComplete: () => void
  imageCount: number
}

const loadingMessages = [
  '正在识别景点信息...',
  '正在提取美食推荐...',
  '正在整理时间线...',
  '正在分析避坑提醒...',
  '正在优化行程顺序...',
  '即将完成...',
]

export function LoadingPage({ onComplete, imageCount }: LoadingPageProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Rotate messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length)
    }, 1500)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(messageInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // Auto complete after animation
    const timeout = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
      clearTimeout(timeout)
    }
  }, [onComplete])

  return (
    <div className="w-full h-full bg-background flex flex-col items-center justify-center p-6">
      {/* Animated Icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <h2 className="text-lg font-bold text-foreground mb-2">
        正在为你提取攻略干货
      </h2>

      {/* Progress Bar */}
      <div className="w-full max-w-[240px] h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Loading Message */}
      <motion.p
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-xs text-primary font-medium"
      >
        {loadingMessages[currentMessage]}
      </motion.p>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * 390,
              y: 844 + 20,
            }}
            animate={{
              y: -20,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}
