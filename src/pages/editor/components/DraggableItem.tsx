import { useDraggableItem } from '@/hooks/use-draggable-item'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { useDrag } from '@/contexts/DragContext'
import { useEffect, useState } from 'react'

interface DraggableItemProps {
  id: string
  index: number
  disabled?: boolean
  className?: string
  showHoverHint?: boolean
  hoverHintText?: string
  children: ReactNode
}

export function DraggableItem({
  id,
  index,
  disabled = false,
  className,
  showHoverHint = true,
  hoverHintText = '拖动排序',
  children,
}: DraggableItemProps) {
  const { elementRef, isDragging, isHovered, handleMouseDown, handleMouseEnter, handleMouseLeave } = useDraggableItem(
    id,
    index,
    disabled,
  )
  const { draggedItem, overIndex } = useDrag()
  const [elementWidth, setElementWidth] = useState(0)

  // 获取元素宽度（包括间距）
  useEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(elementRef.current)
      const marginRight = parseFloat(computedStyle.marginRight)
      const marginLeft = parseFloat(computedStyle.marginLeft)
      setElementWidth(rect.width + marginRight + marginLeft)
    }
  }, [elementRef])

  // 计算 x 轴偏移量
  const calculateXOffset = () => {
    // 如果没有拖拽，返回 0（拖拽结束后立即归零）
    if (!draggedItem || overIndex === null || !elementWidth) return 0

    const draggedIndex = draggedItem.index
    const currentIndex = index

    // 如果是被拖拽的元素本身
    if (isDragging) {
      // 被拖拽元素移动到目标位置
      return (overIndex - currentIndex) * elementWidth
    }

    // 如果拖拽元素从左往右移动
    if (draggedIndex < overIndex) {
      // 在拖拽元素原位置和目标位置之间的元素需要向左移动
      if (currentIndex > draggedIndex && currentIndex <= overIndex) {
        return -elementWidth
      }
    }
    // 如果拖拽元素从右往左移动
    else if (draggedIndex > overIndex) {
      // 在目标位置和拖拽元素原位置之间的元素需要向右移动
      if (currentIndex < draggedIndex && currentIndex >= overIndex) {
        return elementWidth
      }
    }

    return 0
  }

  const xOffset = calculateXOffset()

  return (
    <motion.div
      key={id}
      ref={elementRef}
      initial={false}
      animate={{
        x: xOffset,
        opacity: isDragging ? 0 : 1,
        scale: isDragging ? 0.98 : 1,
      }}
      transition={{
        x: draggedItem
          ? {
              type: 'spring',
              stiffness: 350,
              damping: 30,
              mass: 0.8,
            }
          : { duration: 0 }, // 拖拽结束后立即归零，不要动画
        opacity: { duration: 0.15 },
        scale: { duration: 0.2 },
      }}
      style={{
        // 被拖拽元素的原位置依然占据空间，但完全透明
        visibility: isDragging ? 'hidden' : 'visible',
      }}
      className={cn(
        'relative',
        isHovered && !disabled && 'bg-muted/50 shadow-sm',
        !disabled && 'cursor-grab active:cursor-grabbing',
        className,
      )}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 悬停提示 */}
      {showHoverHint && isHovered && !disabled && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className='absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border shadow-sm whitespace-nowrap z-10'
        >
          {hoverHintText}
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}
