import { useDraggableItem } from '@/hooks/use-draggable-item'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DraggableItem {
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
}: DraggableItem) {
  const { elementRef, isDragging, isOver, isHovered, handleMouseDown, handleMouseEnter, handleMouseLeave } =
    useDraggableItem(id, index, disabled)

  return (
    <div
      ref={elementRef}
      className={cn(
        'relative transition-all duration-200',
        isHovered && !disabled && 'bg-muted/50 ring-2 ring-primary/20 shadow-sm',
        isDragging && 'opacity-30',
        isOver && 'translate-x-2',
        !disabled && 'cursor-grab active:cursor-grabbing',
        className,
      )}
      style={{
        transition: isDragging ? 'opacity 0.2s' : 'all 0.2s ease',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 悬停提示 */}
      {showHoverHint && isHovered && !disabled && (
        <div className='absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border shadow-sm whitespace-nowrap z-10'>
          {hoverHintText}
        </div>
      )}

      {children}
    </div>
  )
}
