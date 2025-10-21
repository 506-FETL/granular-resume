import { useEffect, type ReactNode } from 'react'
import { useDrag } from '@/contexts/DragContext'

interface DraggableListProps<T> {
  items: T[]
  onOrderChange?: (newOrder: T[]) => void
  children: ReactNode
}

export function DraggableList<T>({ items, onOrderChange, children }: DraggableListProps<T>) {
  const { draggedItem, overIndex, endDrag, updateOverIndex } = useDrag()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItem) return
      // 实时更新 overIndex，触发子元素重新计算偏移量
      updateOverIndex(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      // 只在松开鼠标时才更新数据
      if (draggedItem !== null && overIndex !== null) {
        if (draggedItem.index !== overIndex) {
          const newItems = [...items]
          const [removed] = newItems.splice(draggedItem.index, 1)
          newItems.splice(overIndex, 0, removed)

          if (onOrderChange) {
            onOrderChange(newItems)
          }
        }
      }
      endDrag()
    }

    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedItem, overIndex, items, endDrag, updateOverIndex, onOrderChange])

  return <div className='relative '>{children}</div>
}
