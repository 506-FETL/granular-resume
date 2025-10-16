import { useEffect, type ReactNode } from 'react'
import { useDrag } from '@/contexts/DragContext'

interface DraggableListProps<T> {
  items: T[]
  onOrderChange?: (newOrder: T[]) => void // 改：传递完整的 items 数组
  children: ReactNode
}

export function DraggableList<T>({ items, onOrderChange, children }: DraggableListProps<T>) {
  const { draggedItem, overIndex, endDrag, updateOverIndex } = useDrag()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItem) return
      updateOverIndex(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      if (draggedItem !== null && overIndex !== null) {
        if (draggedItem.index !== overIndex) {
          // 重新排序
          const newItems = [...items]
          const [removed] = newItems.splice(draggedItem.index, 1)
          newItems.splice(overIndex, 0, removed)

          // 通知外部新的顺序（传递完整的 items 数组）
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

  return <div className='relative'>{children}</div>
}
