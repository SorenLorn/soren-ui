import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent } from 'react'
import type { HoloErrorInfo } from './imagePipeline'

export interface DropBindings {
  onDragEnter: (event: ReactDragEvent) => void
  onDragOver: (event: ReactDragEvent) => void
  onDragLeave: (event: ReactDragEvent) => void
  onDrop: (event: ReactDragEvent) => void
}

export interface UseImageDropOptions {
  onFile: (file: File) => void
  onReject?: (error: HoloErrorInfo) => void
}

export interface UseImageDropResult {
  /** 拖拽物悬停在投放区内 */
  active: boolean
  /** 当前拖拽位置（归一化到投放区），可用于同步卡片光照 */
  pointer: { x: number; y: number } | null
  bind: DropBindings
}

const hasFiles = (event: ReactDragEvent | DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files')

/**
 * 文件拖拽投放。要点：
 * - dragover 必须 preventDefault，否则不会触发 drop
 * - dragenter/dragleave 用计数器，避免子元素造成的抖动
 * - window 层兜底，防止拖偏后浏览器直接打开图片
 */
export function useImageDrop({ onFile, onReject }: UseImageDropOptions): UseImageDropResult {
  const depth = useRef(0)
  const [active, setActive] = useState(false)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const handlers = useRef({ onFile, onReject })
  handlers.current = { onFile, onReject }

  useEffect(() => {
    const guard = (event: DragEvent) => {
      if (hasFiles(event)) event.preventDefault()
    }
    window.addEventListener('dragover', guard)
    window.addEventListener('drop', guard)
    return () => {
      window.removeEventListener('dragover', guard)
      window.removeEventListener('drop', guard)
    }
  }, [])

  const bind = useMemo<DropBindings>(
    () => ({
      onDragEnter: event => {
        if (!hasFiles(event)) return
        event.preventDefault()
        depth.current += 1
        setActive(true)
      },
      onDragOver: event => {
        if (!hasFiles(event)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
          y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
        })
      },
      onDragLeave: () => {
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) {
          setActive(false)
          setPointer(null)
        }
      },
      onDrop: event => {
        event.preventDefault()
        depth.current = 0
        setActive(false)
        setPointer(null)

        const items = Array.from(event.dataTransfer?.items ?? [])
        const isDirectory = items.some(item => item.webkitGetAsEntry?.()?.isDirectory)
        if (isDirectory) {
          handlers.current.onReject?.({
            reason: 'type',
            message: '暂不支持拖入文件夹，请拖入单个图片文件'
          })
          return
        }

        const file = event.dataTransfer?.files?.[0]
        if (!file) {
          handlers.current.onReject?.({ reason: 'empty', message: '没有读取到文件，请重试' })
          return
        }
        handlers.current.onFile(file)
      }
    }),
    []
  )

  return { active, pointer, bind }
}

/** 粘贴上传：Ctrl/Cmd + V 直接从剪贴板取图 */
export function useImagePaste(onFile: (file: File) => void, enabled = true) {
  const onFileRef = useRef(onFile)
  onFileRef.current = onFile

  useEffect(() => {
    if (!enabled) return undefined
    const handler = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? [])[0]
      if (file) {
        event.preventDefault()
        onFileRef.current(file)
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [enabled])
}
