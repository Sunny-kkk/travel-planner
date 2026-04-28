'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, Image as ImageIcon, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportPageProps {
  onStartGenerate: (images: File[], text: string) => void
}

export function ImportPage({ onStartGenerate }: ImportPageProps) {
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newImages = [...images, ...files]
      setImages(newImages)
      
      // Create preview URLs
      const newUrls = files.map(file => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newUrls])
      setError('')
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setImages(images.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (images.length === 0 && !text.trim()) {
      setError('请上传截图或粘贴笔记内容')
      return
    }
    onStartGenerate(images, text)
  }

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-xl font-bold text-foreground">生成你的专属旅行计划</h1>
        <p className="text-xs text-muted-foreground mt-1">上传小红书攻略，AI自动提取行程</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {/* Upload Area */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            上传小红书攻略截图
          </label>
          
          {/* Uploaded Images Preview */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {previewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={url}
                    alt={`截图 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upload Box */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full border-2 border-dashed rounded-xl p-6 transition-colors",
              "border-border hover:border-primary hover:bg-primary/5",
              "flex flex-col items-center justify-center gap-2"
            )}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">
              点击上传截图
            </span>
            <span className="text-[10px] text-muted-foreground">
              支持多张截图同时上传
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground">或者</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            <FileText className="w-3.5 h-3.5 text-primary" />
            粘贴笔记文本内容
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError('')
            }}
            placeholder="复制小红书笔记内容，粘贴到这里..."
            rows={5}
            className="w-full px-3 py-2.5 bg-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-destructive text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          开始生成
        </button>
        <p className="text-[10px] text-muted-foreground text-center">
          AI将自动提取景点、美食、时间、避坑提醒等核心信息
        </p>
      </div>
    </div>
  )
}
