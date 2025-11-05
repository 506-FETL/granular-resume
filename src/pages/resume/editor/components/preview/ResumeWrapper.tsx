import type { PropsWithChildren, Ref } from 'react'
import { useEffect, useRef, useState } from 'react'
import useResumeConfigStore from '@/store/resume/config'

// A4 纸张尺寸，单位毫米
const A4_HEIGHT_MM = 297
const MM_TO_PX = 3.7795275591

export default function ResumeWrapper({ children, ref }: PropsWithChildren<{ ref: Ref<HTMLDivElement> | null }>) {
  const spacingConfig = useResumeConfigStore(state => state.spacing)
  const fontConfig = useResumeConfigStore(state => state.font)
  const contentRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  // 实时计算页数
  useEffect(() => {
    const updatePageCount = () => {
      if (!contentRef.current)
        return

      const contentHeight = contentRef.current.scrollHeight
      const pageMargin = spacingConfig.pageMargin
      const a4HeightPx = A4_HEIGHT_MM * MM_TO_PX

      // 添加一个小的容差值（5px），避免因为浏览器渲染误差导致多出一页空白
      const tolerance = 5
      const adjustedContentHeight = Math.max(0, contentHeight - tolerance)

      // absolute 定位根据整张 A4 的高度滚动内容，因此单页可容纳的高度需要按照整页来折算，
      // 同时额外加上首屏的页边距，避免出现没有实际内容的空白页。
      const heightWithTopMargin = adjustedContentHeight + pageMargin
      const calculatedPages = Math.max(1, Math.ceil(heightWithTopMargin / a4HeightPx))

      setPageCount(calculatedPages)
    }

    // 使用 ResizeObserver 监听内容变化
    const resizeObserver = new ResizeObserver(updatePageCount)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    // 初始计算
    updatePageCount()

    return () => {
      resizeObserver.disconnect()
    }
  }, [
    spacingConfig.pageMargin,
    spacingConfig.sectionSpacing,
    spacingConfig.lineHeight,
    fontConfig.fontSize,
    fontConfig.fontFamily,
  ])

  return (
    <div className="flex flex-col gap-4" ref={ref}>
      {Array.from({ length: pageCount }).map((_, pageIndex) => (
        <div key={`page-${pageIndex + 1}`}>
          <div
            className="mx-auto bg-white border rounded-md shadow-md overflow-hidden"
            style={{
              width: '210mm',
              height: '297mm',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${-pageIndex * (A4_HEIGHT_MM * MM_TO_PX) + spacingConfig.pageMargin}px`,
                left: `${spacingConfig.pageMargin}px`,
                right: `${spacingConfig.pageMargin}px`,
              }}
            >
              {pageIndex === 0
                ? (
                    <div ref={contentRef} data-resume-content>
                      {children}
                    </div>
                  )
                : (
                    children
                  )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
