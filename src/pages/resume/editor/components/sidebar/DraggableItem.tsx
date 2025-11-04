import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useDrag } from '@/contexts/DragContext'
import { useDraggableItem } from '@/hooks/use-draggable-item'
import { cn } from '@/lib/utils'

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
      const marginRight = Number.parseFloat(computedStyle.marginRight)
      const marginLeft = Number.parseFloat(computedStyle.marginLeft)
      setElementWidth(rect.width + marginRight + marginLeft)
    }
  }, [elementRef])

  // 计算 x 轴偏移量
  const calculateXOffset = () => {
    if (disabled)
      return 0
    // 如果没有拖拽或没有元素宽度，返回 0
    if (!draggedItem || !elementWidth)
      return 0

    const draggedIndex = draggedItem.index
    const currentIndex = index
    // 如果 overIndex 为 null，使用 draggedIndex 作为默认值（刚开始拖拽时）
    const targetIndex = overIndex === null ? draggedIndex : overIndex

    // 如果是被拖拽的元素本身，不移动（原位置隐藏，DragContext 显示预览）
    if (isDragging) {
      return 0
    }

    // 如果拖拽元素在原位（没有移动），所有元素都不需要偏移
    if (draggedIndex === targetIndex) {
      return 0
    }

    // 如果拖拽元素从左往右移动（draggedIndex < targetIndex）
    if (draggedIndex < targetIndex) {
      // 在拖拽元素和目标位置之间的元素需要向左移动，填补被拖走的空位
      // 例如：[0,1,2,3,4]，拖 1 到 3 的位置，则 2 和 3 向左移
      if (currentIndex > draggedIndex && currentIndex <= targetIndex) {
        return -elementWidth
      }
    }
    // 如果拖拽元素从右往左移动（draggedIndex > targetIndex）
    else {
      // 在目标位置和拖拽元素之间的元素需要向右移动，为拖入的元素让出空位
      // 例如：[0,1,2,3,4]，拖 3 到 1 的位置，则 1 和 2 向右移
      if (currentIndex >= targetIndex && currentIndex < draggedIndex) {
        return elementWidth
      }
    }

    return 0
  }

  const xOffset = calculateXOffset()

  // 判断是否拖回原位
  const isDraggingBackToOriginal = isDragging && draggedItem && overIndex !== null && draggedItem.index === overIndex

  return (
    <motion.div
      key={id}
      ref={elementRef}
      initial={false}
      animate={{
        x: xOffset,
        opacity: isDragging ? (isDraggingBackToOriginal ? 0.3 : 0) : 1,
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
        // 只有在拖拽到其他位置时才隐藏原位置
        visibility: isDragging && !isDraggingBackToOriginal ? 'hidden' : 'visible',
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
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border shadow-sm whitespace-nowrap z-10"
        >
          {hoverHintText}
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}
