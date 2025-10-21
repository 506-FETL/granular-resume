import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DragItem {
  index: number
  id: string
  element: HTMLElement
}

interface ItemPosition {
  id: string
  index: number
  centerX: number
  left: number
  right: number
  width: number
}

interface DragContextValue {
  draggedItem: DragItem | null
  overIndex: number | null
  registerItem: (index: number, id: string, element: HTMLElement) => void
  unregisterItem: (id: string) => void
  startDrag: (index: number, id: string, startX: number, startY: number) => void
  endDrag: () => void
  updateOverIndex: (clientX: number, clientY: number) => void
}

const DragContext = createContext<DragContextValue | null>(null)

export function DragProvider({ children }: { children: ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 })
  const [initialRect, setInitialRect] = useState<DOMRect | null>(null)
  const itemsRef = useRef<Map<string, { index: number; element: HTMLElement }>>(new Map())
  const positionsRef = useRef<ItemPosition[]>([])
  const startPosRef = useRef({ x: 0, y: 0 })

  const registerItem = useCallback((index: number, id: string, element: HTMLElement) => {
    itemsRef.current.set(id, { index, element })
  }, [])

  const unregisterItem = useCallback((id: string) => {
    itemsRef.current.delete(id)
  }, [])

  const calculatePositions = useCallback(() => {
    const positions: ItemPosition[] = []
    itemsRef.current.forEach(({ index, element }, id) => {
      const rect = element.getBoundingClientRect()
      positions.push({
        id,
        index,
        centerX: rect.left + rect.width / 2,
        left: rect.left,
        right: rect.right,
        width: rect.width,
      })
    })
    positionsRef.current = positions.sort((a, b) => a.index - b.index)
  }, [])

  const startDrag = useCallback(
    (index: number, id: string, startX: number, startY: number) => {
      const item = itemsRef.current.get(id)
      if (item) {
        const rect = item.element.getBoundingClientRect()
        setInitialRect(rect)
        calculatePositions()
        startPosRef.current = { x: startX, y: startY }
        setPreviewPos({ x: rect.left, y: rect.top })
        setDraggedItem({ index, id, element: item.element })
        setOverIndex(index)
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'grabbing'
      }
    },
    [calculatePositions],
  )

  const updateOverIndex = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggedItem || !initialRect) return

      // 更新预览位置
      const offsetX = clientX - startPosRef.current.x
      const offsetY = clientY - startPosRef.current.y
      setPreviewPos({
        x: initialRect.left + offsetX,
        y: initialRect.top + offsetY,
      })

      let newOverIndex = draggedItem.index
      let minDistance = Infinity

      positionsRef.current.forEach((pos) => {
        if (pos.id === draggedItem.id) return

        const distance = Math.abs(clientX - pos.centerX)

        if (distance < minDistance) {
          minDistance = distance
          newOverIndex = clientX < pos.centerX ? pos.index : pos.index
        }
      })

      const firstPos = positionsRef.current[0]
      const lastPos = positionsRef.current[positionsRef.current.length - 1]

      if (firstPos && clientX < firstPos.left) {
        newOverIndex = 0
      } else if (lastPos && clientX > lastPos.right) {
        newOverIndex = positionsRef.current.length - 1
      }

      if (newOverIndex !== overIndex) {
        setOverIndex(newOverIndex)
      }
    },
    [draggedItem, overIndex, initialRect],
  )

  const endDrag = useCallback(() => {
    setDraggedItem(null)
    setOverIndex(null)
    setPreviewPos({ x: 0, y: 0 })
    setInitialRect(null)
    positionsRef.current = []
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  // 渲染拖拽预览
  const renderDragPreview = () => {
    if (!draggedItem || !initialRect) return null

    return createPortal(
      <div
        style={{
          position: 'fixed',
          left: `${previewPos.x}px`,
          top: `${previewPos.y}px`,
          width: `${initialRect.width}px`,
          height: `${initialRect.height}px`,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.9,
          transform: ' scale(1.05)',
          transition: 'transform 0.1s ease',
        }}
      >
        <div className='h-full w-full shadow-2xl rounded-lg border-2 border-primary/50 bg-background/95 backdrop-blur-sm'>
          {/* 克隆原始内容 */}
          <div
            dangerouslySetInnerHTML={{
              __html: draggedItem.element.innerHTML,
            }}
          />
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <DragContext.Provider
      value={{
        draggedItem,
        overIndex,
        registerItem,
        unregisterItem,
        startDrag,
        endDrag,
        updateOverIndex,
      }}
    >
      {children}
      {renderDragPreview()}
    </DragContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDrag() {
  const context = useContext(DragContext)
  if (!context) {
    throw new Error('useDrag must be used within DragProvider')
  }
  return context
}
