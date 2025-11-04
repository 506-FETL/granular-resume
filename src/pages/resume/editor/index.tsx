import type { SupabaseUser } from './types'
import type { VisibilityItemsType } from '@/lib/schema'
import { saveAs } from 'file-saver'
import { Edit, FileDown, FileText, Printer } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import { DraggableList } from '@/components/DraggableList'
import { RealtimeCursors } from '@/components/realtime-cursors'
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DragProvider } from '@/contexts/DragContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { isOfflineResumeId } from '@/lib/offline-resume-manager'
import { getFontFamilyCSS, themeColorMap } from '@/lib/schema'
import { subscribeToResumeConfigUpdates } from '@/lib/supabase/resume'
import { getCurrentUser } from '@/lib/supabase/user'
import useCollaborationStore from '@/store/collaboration'
import useResumeConfigStore from '@/store/resume/config'
import useCurrentResumeStore from '@/store/resume/current'
import useResumeStore from '@/store/resume/form'
import { CollaborationControls } from './components/CollaborationControls'
import { CollaborationDialog } from './components/CollaborationDialog'
import { CollaborationPanelProvider } from './components/CollaborationPanelProvider'
import { DraggableItem } from './components/DraggableItem'
import ResumeWrapper from './components/preview/ResumeWrapper'
import { BasicResumeContent } from './components/preview/templates/Basic'
import { ResumeConfigToolbar } from './components/ResumeConfigToolbar'
import { ITEMS } from './data'

function Editor() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUserState] = useState<SupabaseUser>(null)
  const { theme } = useTheme()
  const resumeId = useCurrentResumeStore(state => state.resumeId)
  const { setCurrentResume } = useCurrentResumeStore()
  const navigate = useNavigate()
  const queryResumeId = searchParams.get('resumeId')
  const sharedDocUrl = searchParams.get('docUrl')
  const collabSessionParam = searchParams.get('collabSession')
  const activeResumeId = resumeId ?? queryResumeId ?? undefined

  const pdfRef = useRef<HTMLDivElement | null>(null)
  const docExportRef = useRef<HTMLDivElement | null>(null)
  const resumeName = useResumeStore(state => state.basics.name)

  const {
    activeTabId,
    order,
    updateActiveTabId,
    updateOrder,
    toggleVisibility,
    visibility: visibilityState,
    loadResumeData,
  } = useResumeStore()

  const roomName = useCollaborationStore(state => state.roomName)

  const orderDraggable = order.filter(id => id !== 'basics')
  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'
  const userDisplayName = useMemo(() => (currentUser ? getUserDisplayName(currentUser) : ''), [currentUser])

  const spacingConfig = useResumeConfigStore(state => state.spacing)
  const fontConfig = useResumeConfigStore(state => state.font)
  const themeConfig = useResumeConfigStore(state => state.theme)

  const resumeTheme = themeColorMap[themeConfig.theme]
  const spacing = {
    pagePadding: `${spacingConfig.pageMargin}px`,
    sectionMargin: `${spacingConfig.sectionSpacing}px`,
    sectionTitleMargin: '0.75rem',
    itemSpacing: '0.55rem',
    paragraphSpacing: '0.25rem',
    lineHeight: spacingConfig.lineHeight,
    proseLineHeight: spacingConfig.lineHeight,
  }

  const fontSize = fontConfig.fontSize
  const font = {
    fontFamily: getFontFamilyCSS(fontConfig.fontFamily),
    nameSize: `${fontSize * 1.5}px`,
    jobIntentSize: `${fontSize}px`,
    sectionTitleSize: `${fontSize}px`,
    contentSize: `${fontSize * 0.875}px`,
    smallSize: `${fontSize * 0.75}px`,
    boldWeight: 700,
    mediumWeight: 600,
    normalWeight: 400,
  }

  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: resumeName ? `${resumeName}-简历` : '我的简历',
  })

  const handleExportPdf = () => {
    setExportDialogOpen(false)
    try {
      handlePrint?.()
    }
    catch (error) {
      console.error('导出 PDF 失败', error)
      toast.error('导出 PDF 失败,请稍后重试')
    }
  }

  const handleExportDoc = () => {
    setExportDialogOpen(false)
    const exportNode = docExportRef.current
    if (!exportNode) {
      toast.error('未找到可导出的内容')
      return
    }

    try {
      const html = createResumeDocHtml(exportNode.innerHTML, {
        baseFontSize: fontSize,
        fontFamily: font.fontFamily,
        lineHeight: spacingConfig.lineHeight,
        pageMargin: spacingConfig.pageMargin,
        badgeBackground: resumeTheme.badgeBg,
        textPrimary: resumeTheme.textPrimary,
      })

      // 创建一个 Blob 对象,类型为 Word 文档
      const blob = new Blob([html], {
        type: 'application/msword',
      })

      saveAs(blob, resumeName ? `${resumeName}-简历.doc` : '我的简历.doc')
      toast.success('导出成功!请注意:建议在 Word 中打开后另存为 .docx 格式以获得最佳兼容性。')
    }
    catch (error) {
      console.error('导出 Word 失败', error)
      toast.error('导出 Word 失败,请稍后重试')
    }
  }

  useEffect(() => {
    let mounted = true
    getCurrentUser().then((user) => {
      if (mounted) {
        setCurrentUserState(user)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      useResumeStore.getState().cleanup()
      useCollaborationStore.getState().stopSharing({ silent: true })
    }
  }, [])

  useEffect(() => {
    if (queryResumeId && collabSessionParam) {
      // 如果有协作会话参数，强制切换到链接中的简历
      setCurrentResume(queryResumeId, 'default')
    }
    else if (!resumeId && queryResumeId) {
      setCurrentResume(queryResumeId, 'default')
    }
  }, [resumeId, queryResumeId, collabSessionParam, setCurrentResume])

  useEffect(() => {
    if (!activeResumeId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    loadResumeData(activeResumeId, sharedDocUrl ? { documentUrl: sharedDocUrl } : undefined)
      .catch((error: any) => {
        if (cancelled)
          return
        toast.error(`加载简历失败, ${error.message || '未知错误'}`)
        navigate('/resume')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeResumeId, loadResumeData, navigate, sharedDocUrl])

  useEffect(() => {
    if (!activeResumeId || isOfflineResumeId(activeResumeId) || !currentUser)
      return

    let unSubscribe: (() => void) | undefined
    let cancelled = false

    subscribeToResumeUpdates()

    async function subscribeToResumeUpdates() {
      try {
        unSubscribe = await subscribeToResumeConfigUpdates((payload) => {
          if (cancelled)
            return
          if (payload.eventType !== 'DELETE')
            return

          const deletedResumeId = payload.old.resume_id
          if (deletedResumeId !== activeResumeId)
            return

          const resumeName = payload.old.display_name || '简历'
          toast.error(`简历 "${resumeName}" 已在其他窗口被删除`, {
            duration: 5000,
          })

          navigate('/resume')
        })
      }
      catch (error: any) {
        toast.error(`监听简历更新失败, ${error.message || '未知错误'}`)
      }
    }

    return () => {
      cancelled = true
      unSubscribe?.()
    }
  }, [activeResumeId, currentUser, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner className="mx-auto" />
          <p className="mt-4 text-muted-foreground">加载简历中...</p>
        </div>
      </div>
    )
  }

  return (
    <CollaborationPanelProvider
      currentUser={currentUser}
      activeResumeId={activeResumeId}
      userDisplayName={userDisplayName}
    >
      <>
        {roomName && currentUser && (
          <RealtimeCursors roomName={roomName} username={userDisplayName || `用户-${currentUser.id.slice(0, 6)}`} />
        )}
        <DragProvider>
          <Drawer open={open} onOpenChange={setOpen} handleOnly>
            <DrawerTrigger asChild>
              <RainbowButton
                variant="outline"
                className="fixed bottom-6 left-1/2 z-1 -transform -translate-x-1/2"
                size={isMobile ? 'icon' : 'default'}
              >
                <Edit />
                {!isMobile && '编辑简历'}
              </RainbowButton>
            </DrawerTrigger>
            <DrawerContent className="h-160">
              <CollaborationControls />
              <div className="p-4 overflow-y-scroll overflow-x-hidden">
                <DraggableList items={orderDraggable} onOrderChange={order => updateOrder(['basics', ...order])}>
                  <SideTabsWrapper defaultId={activeTabId}>
                    <SideTabs>
                      <div className="flex flex-col items-center justify-end gap-2">
                        <Tab
                          id="basics"
                          onClick={() => updateActiveTabId('basics')}
                          disabled={visibilityState['basics' as VisibilityItemsType]}
                        >
                          {ITEMS.find(item => item.id === 'basics')?.icon}
                          {!isMobile && ITEMS.find(item => item.id === 'basics')?.label}
                        </Tab>
                      </div>
                      {orderDraggable.map((itm, index) => {
                        const item = ITEMS.find(it => it.id === itm)!
                        return (
                          <DraggableItem id={item.id} index={index} key={item.id} disabled={item.id === 'basics'}>
                            <div key={item.id} className="flex flex-col items-center justify-end gap-2">
                              {item.id !== 'basics' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Switch
                                        checked={!visibilityState[item.id as VisibilityItemsType]}
                                        onCheckedChange={() => toggleVisibility(item.id as VisibilityItemsType)}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>点击可隐藏模块</TooltipContent>
                                </Tooltip>
                              )}
                              <Tab
                                id={item.id}
                                onClick={() => updateActiveTabId(item.id)}
                                disabled={visibilityState[item.id as VisibilityItemsType]}
                              >
                                {item.icon}
                                {!isMobile && item.label}
                              </Tab>
                            </div>
                          </DraggableItem>
                        )
                      })}
                    </SideTabs>
                    <ViewPort items={ITEMS} fill={fill} stroke={stroke} />
                  </SideTabsWrapper>
                </DraggableList>
              </div>
            </DrawerContent>
          </Drawer>
          <div className="flex flex-col md:flex-row min-h-screen overflow-auto">

            <ResumeConfigToolbar>
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size={isMobile ? 'icon' : 'sm'}>
                    <FileDown className="h-4 w-4" />
                    {!isMobile && <span className="ml-2">导出</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>导出简历</DialogTitle>
                    <DialogDescription>选择导出格式，导出内容将与页面预览保持一致。</DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={handleExportPdf}>
                      <Printer className="mr-2 h-4 w-4" />
                      导出 PDF
                    </Button>
                    <Button onClick={handleExportDoc}>
                      <FileText className="mr-2 h-4 w-4" />
                      导出 Word
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </ResumeConfigToolbar>

            <div className="flex-1 overflow-auto p-4 md:p-8">
              <ResumeWrapper ref={pdfRef}>
                <BasicResumeContent font={font} spacing={spacing} theme={resumeTheme} />
              </ResumeWrapper>
              <div
                ref={docExportRef}
                style={{ position: 'absolute', left: '-99999px', top: 0, width: '210mm', pointerEvents: 'none', visibility: 'hidden' }}
                aria-hidden="true"
              >
                <BasicResumeContent font={font} spacing={spacing} theme={resumeTheme} />
              </div>
            </div>
          </div>
        </DragProvider>
        <CollaborationDialog />
      </>
    </CollaborationPanelProvider>
  )
}

export default Editor

function getUserDisplayName(user: SupabaseUser) {
  if (!user)
    return ''

  const fullName
    = (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined)

  if (fullName)
    return fullName
  if (user.email)
    return user.email
  return `用户-${user.id.slice(0, 6)}`
}

const PX_TO_MM = 25.4 / 96

interface DocHtmlOptions {
  fontFamily: string
  baseFontSize: number
  lineHeight: number
  pageMargin: number
  badgeBackground: string
  textPrimary: string
}

function createResumeDocHtml(contentHtml: string, options: DocHtmlOptions) {
  const {
    fontFamily,
    baseFontSize,
    lineHeight,
    pageMargin,
    badgeBackground,
    textPrimary,
  } = options

  const pageMarginMm = (pageMargin * PX_TO_MM).toFixed(2)
  const gapValue = (factor: number) => `${(baseFontSize * factor).toFixed(2)}px`
  const badgePaddingY = (baseFontSize * 0.125).toFixed(2)
  const badgePaddingX = (baseFontSize * 0.45).toFixed(2)
  const badgeFontSize = (baseFontSize * 0.75).toFixed(2)
  const badgeMargin = (baseFontSize * 0.5).toFixed(2)
  const progressHeight = Math.max(baseFontSize * 0.125, 4).toFixed(2)
  const proseFontSize = (baseFontSize * 0.875).toFixed(2)

  const styles = `
    @page {
      size: A4;
      margin: ${pageMarginMm}mm;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      color: ${textPrimary};
      background: #ffffff;
      line-height: ${lineHeight};
    }

    .resume-export {
      box-sizing: border-box;
      width: 210mm;
      margin: 0 auto;
      padding: ${pageMargin}px;
      background: #ffffff;
    }

    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .items-baseline { align-items: baseline; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-4 { gap: ${gapValue(1)}; }
    .gap-3 { gap: ${gapValue(0.75)}; }
    .gap-2 { gap: ${gapValue(0.5)}; }
    .gap-1 { gap: ${gapValue(0.25)}; }
    .mb-2 { margin-bottom: ${gapValue(0.5)}; }
    .mt-2 { margin-top: ${gapValue(0.5)}; }
    .m-0 { margin: 0; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .whitespace-nowrap { white-space: nowrap; }
    .grid { display: grid; }
    .flex-1 { flex: 1 1 0%; }
    .h-2 { height: ${progressHeight}px; }
    .h-full { height: 100%; }
    .rounded { border-radius: 9999px; }
    .rounded-md { border-radius: 12px; }
    .overflow-hidden { overflow: hidden; }
    .min-w-\\[3em\\] { min-width: 3em; }
    .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
    .prose { line-height: ${lineHeight}; font-size: ${proseFontSize}px; }

    [data-slot="badge"] {
      display: inline-block;
      padding: ${badgePaddingY}px ${badgePaddingX}px;
      border-radius: 999px;
      background: ${badgeBackground};
      color: ${textPrimary};
      font-size: ${badgeFontSize}px;
      margin-right: ${badgeMargin}px;
      margin-bottom: ${badgeMargin}px;
      border: 1px solid rgba(15, 23, 42, 0.08);
    }
  `

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Resume</title>
    <style>
${styles}
    </style>
  </head>
  <body>
    <article class="resume-export">
${contentHtml}
    </article>
  </body>
</html>`
}
