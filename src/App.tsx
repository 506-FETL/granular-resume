import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarHeader, SidebarInset } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { Suspense, useEffect } from 'react'
import { useLocation, useRoutes } from 'react-router-dom'
import routes from '~react-pages'

function App() {
  const location = useLocation()

  // 预加载策略：当用户到达首页时，预加载编辑器页面
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/login') {
      // 延迟预加载编辑器相关资源
      const timer = setTimeout(() => {
        // 预加载编辑器路由
        import('./pages/editor/index')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <AppSidebar variant='inset' />
      <SidebarInset className='relative overflow-hidden'>
        <SidebarHeader className='border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
          <SiteHeader />
        </SidebarHeader>
        <Suspense fallback={<Loading />}>
          <div className='p-4'>{useRoutes(routes)}</div>
        </Suspense>
        <Toaster position='top-right' richColors />
      </SidebarInset>
    </ThemeProvider>
  )
}

function Loading() {
  return (
    <div className='w-full h-screen flex items-center justify-center px-4 bg-background'>
      <div className='flex flex-col space-y-6 w-full max-w-md'>
        <Skeleton className='h-48 w-full rounded-xl' />
        <div className='space-y-3'>
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-5 w-2/3' />
          <Skeleton className='h-5 w-1/2' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </div>
    </div>
  )
}

export default App
