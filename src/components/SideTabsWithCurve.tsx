'use client'

import type { ReactNode } from 'react'
import { CircleEllipsis } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsMobile } from '../hooks/use-mobile'

export interface Item<T> {
  id: T
  label: string
  content: ReactNode
  icon?: ReactNode
}

interface Props {
  items: Item<string>[]
  defaultId?: string
  className?: string
  gapPx?: number // tabs 区域与内容区间距（主轴方向）
  offsetX?: number // 线条从按钮偏移量，避免压住按钮圆角
  padding?: number // 内容区内边距（影响线条落点）
  minHeight?: number // 内容区最小高度
  strokeWidth?: number // 轮廓线粗细
  orientation?: 'horizontal' | 'vertical' // 布局方向：horizontal 左右，vertical 上下
  stroke?: string
  fill?: string
  radius?: number
  controlDown?: number
}

export function SideTabsWithCurve({
  items,
  defaultId,
  className,
  gapPx = 6,
  offsetX = 12,
  padding = 0,
  minHeight = 240,
  strokeWidth = 1,
  orientation = 'vertical',
  stroke = 'gray',
  fill = 'transparent',
  radius = 12,
  controlDown = 12,
}: Props) {
  const isMobile = useIsMobile()
  const [active, setActive] = useState<string>(defaultId ?? items[0]?.id)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const contentRef = useRef<HTMLDivElement | null>(null)

  // 右侧内容盒几何（容器坐标）
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: minHeight, totalHeight: minHeight })

  // 闭合路径 d
  const [outlineD, setOutlineD] = useState('')

  /** 计算右侧盒尺寸（随内容变化） */
  const computeBox = useCallback(() => {
    const container = containerRef.current
    const tabs = tabsRef.current
    const contentEl = contentRef.current
    if (!container || !tabs || !contentEl)
      return

    const cRect = container.getBoundingClientRect()
    const tRect = tabs.getBoundingClientRect()
    const innerH = contentEl.scrollHeight || 0
    const h = Math.max(minHeight, innerH + padding * 2)

    if (orientation === 'horizontal') {
      const x = tRect.right - cRect.left + gapPx
      const rawW = cRect.right - (tRect.right + gapPx) - cRect.left
      const w = Math.max(0, rawW)
      const totalHeight = Math.max(h, tRect.height)
      const next = { x, y: 0, w, h, totalHeight }
      setBox(prev => (
        prev.x !== next.x
        || prev.y !== next.y
        || prev.w !== next.w
        || prev.h !== next.h
        || prev.totalHeight !== next.totalHeight
          ? next
          : prev
      ))
      return
    }

    const y = tRect.bottom - cRect.top + gapPx
    const w = Math.max(0, cRect.width)
    const x = 0
    const totalHeight = y + h
    const next = { x, y, w, h, totalHeight }
    setBox(prev => (
      prev.x !== next.x
      || prev.y !== next.y
      || prev.w !== next.w
      || prev.h !== next.h
      || prev.totalHeight !== next.totalHeight
        ? next
        : prev
    ))
  }, [gapPx, minHeight, orientation, padding])

  /** 计算单条闭合 outline 路径 */
  const computeOutline = useCallback(() => {
    const container = containerRef.current
    const tabs = tabsRef.current
    const btn = btnRefs.current[active]
    if (!container || !tabs || !btn)
      return

    if (box.w <= 0 || box.h <= 0)
      return

    const cRect = container.getBoundingClientRect()
    const tRect = tabs.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()

    if (orientation === 'horizontal') {
      // 起点：按钮右侧中点（略缩进）
      const sx = tRect.right - cRect.left - offsetX
      const sy = bRect.top + bRect.height / 2 - cRect.top

      // 盒内关键点
      const xIn = box.x // 盒左内边（曲线进入处）
      const xt = box.x + box.w - padding // 顶/底直线右端（圆角起点）
      const yb = box.y + box.h - padding // 底线 y
      const yt = box.y + padding // 顶线 y

      // 按钮 → 盒内的平滑曲线控制点
      const span = xIn - sx
      const dx = span * 2
      const c1x = sx + dx * 0.5
      const c2xTop = xIn - dx * 0.5
      const c2xBot = xIn - dx * 0.5

      // 右侧圆角参数
      const yr1 = yt + radius
      const yr2 = yb - radius

      const d
        = `M ${sx},${sy} `
          + `C ${c1x},${sy} ${c2xTop},${yt} ${xIn},${yt} `
          + `L ${xt - radius},${yt} `
          + `A ${radius},${radius} 0 0 1 ${xt},${yr1} `
          + `L ${xt},${yr2} `
          + `A ${radius},${radius} 0 0 1 ${xt - radius},${yb} `
          + `L ${xIn},${yb} `
          + `C ${c2xBot},${yb} ${c1x},${sy} ${sx},${sy} Z`

      setOutlineD(d)
      return
    }

    // vertical orientation
    const sx = bRect.left + bRect.width / 2 - cRect.left
    const sy = bRect.bottom - cRect.top + offsetX

    // 盒内关键点
    const innerWidth = Math.max(box.w - padding * 2, 0)
    const xl = box.x + padding
    const xr = xl + innerWidth
    const yTop = box.y + padding
    const yBottom = box.y + box.h - padding

    if (xr <= xl || yBottom <= yTop) {
      setOutlineD('')
      return
    }

    const availableWidth = xr - xl
    const tailWidth = Math.max(
      Math.min(availableWidth * 0.6, 160),
      Math.min(availableWidth, 48),
    )
    if (tailWidth <= 0) {
      setOutlineD('')
      return
    }
    const halfTail = tailWidth / 2
    const entryCenter = Math.min(Math.max(sx, xl + halfTail), xr - halfTail)
    const entryLeft = entryCenter - halfTail
    const entryRight = entryCenter + halfTail

    const curveMidY = sy + controlDown
    const rightCtrlX = Math.max(entryRight - tailWidth * 0.25, entryLeft)
    const leftCtrlX = Math.min(entryLeft + tailWidth * 0.25, entryRight)

    const xt = xr - radius // 圆角起点（水平向左 radius）
    const yr1 = yTop + radius // 右上圆角切点 y
    const yr2 = yBottom - radius // 右下圆角切点 y

    const d
      = `M ${sx},${sy} `
        // 进入顶部：最后一个控制点与终点同高(yTop)，保证与水平顶边切线连续
        + `C ${sx},${curveMidY} ${rightCtrlX},${yTop} ${entryRight},${yTop} `
        + `L ${xt},${yTop} `
        + `A ${radius},${radius} 0 0 1 ${xr},${yr1} `
        + `L ${xr},${yr2} `
        + `A ${radius},${radius} 0 0 1 ${xt},${yBottom} `
        + `L ${xl + radius},${yBottom} `
        + `A ${radius},${radius} 0 0 1 ${xl},${yBottom - radius} `
        + `L ${xl},${yTop + radius} `
        + `A ${radius},${radius} 0 0 1 ${xl + radius},${yTop} `
        // 离开顶部：第一个控制点与起点同高(yTop)，保证与水平顶边切线连续
        + `C ${leftCtrlX},${yTop} ${sx},${curveMidY} ${sx},${sy} `
        + `Z`

    setOutlineD(d)
  }, [active, box, offsetX, orientation, padding, radius, controlDown])

  // 初始 & 依赖变化
  useEffect(() => {
    computeBox()
  }, [computeBox])
  useEffect(() => {
    computeOutline()
  }, [computeOutline])

  // 监听尺寸/内容变化
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      computeBox()
      requestAnimationFrame(() => computeOutline())
    })
    if (containerRef.current)
      ro.observe(containerRef.current)
    if (tabsRef.current)
      ro.observe(tabsRef.current)
    if (contentRef.current)
      ro.observe(contentRef.current)

    const onScrollOrResize = () => {
      computeBox()
      requestAnimationFrame(() => computeOutline())
    }
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [computeBox, computeOutline])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative mx-auto flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className,
      )}
      style={{ height: box.totalHeight }}
    >
      <div
        ref={tabsRef}
        className={cn(
          'flex gap-3',
          orientation === 'horizontal' ? 'flex-col pr-4' : 'flex-row flex-wrap pb-4',
        )}
      >
        {items.map((it) => {
          it.icon = it.icon ?? <CircleEllipsis />

          return (
            <Button
              size={isMobile ? 'icon' : 'sm'}
              key={it.id}
              ref={(el) => { btnRefs.current[it.id] = el }}
              variant={active === it.id ? 'default' : 'secondary'}
              className={cn(
                'justify-center transition-all',
              )}
              onClick={() => {
                setActive(it.id)
                requestAnimationFrame(() => {
                  computeBox()
                  requestAnimationFrame(() => computeOutline())
                })
              }}
            >
              {it.icon}
              {!isMobile && it.label}
            </Button>
          )
        })}
      </div>

      {/* 右侧绘制区域：使用绝对定位覆盖整个容器，按钮保持在普通流 */}
      <svg
        className="absolute inset-0 block -z-1"
        width="100%"
        height={box.totalHeight}
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        <defs>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.12" />
          </filter>
        </defs>

        {outlineD && (
          <motion.path
            d={outlineD}
            initial={false}
            animate={{ d: outlineD }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            shapeRendering="geometricPrecision"
          />
        )}

      </svg>
      <svg
        className="absolute inset-0 block z-1"
        width="100%"
        height={box.totalHeight}
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        {/* 内容：被闭合路径“包裹”的区域（与盒几何一致） */}
        <foreignObject
          x={box.x}
          y={box.y}
          width={Math.max(box.w, 0)}
          height={Math.max(box.h, 0)}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: `${padding}px`,
              boxSizing: 'border-box',
              pointerEvents: 'auto', // 允许交互
            }}
          >
            <div ref={contentRef}>
              <AnimatePresence mode="wait">
                {items.map(it =>
                  it.id === active
                  && (
                    <motion.div
                      key={it.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="prose max-w-none dark:prose-invert p-6"
                    >
                      {it.content}
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}
