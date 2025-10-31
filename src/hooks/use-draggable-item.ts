import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useDrag } from '@/contexts/DragContext'

export function useDraggableItem(id: string, index: number, disabled = false) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { draggedItem, overIndex, registerItem, unregisterItem, startDrag } = useDrag()

  const isDragging = draggedItem?.id === id
  const isOver = overIndex === index && !isDragging

  useEffect(() => {
    if (elementRef.current && !disabled) {
      registerItem(index, id, elementRef.current)
      return () => unregisterItem(id)
    }
  }, [id, index, disabled, registerItem, unregisterItem, elementRef])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled)
      return

    // 检查是否点击了 Switch 或 Tab 等交互元素
    const target = e.target as HTMLElement
    if (target.closest('[role="switch"]') || target.closest('button[role="switch"]') || target.closest('.tab-button')) {
      return
    }

    e.preventDefault()
    e.stopPropagation()
    startDrag(index, id, e.clientX, e.clientY)
  }

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return {
    elementRef,
    isDragging,
    isOver,
    isHovered,
    handleMouseDown,
    handleMouseEnter,
    handleMouseLeave,
  }
}
