import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarHeader, SidebarInset } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from '~react-pages'

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <AppSidebar variant='inset' />
      <SidebarInset className='relative overflow-hidden'>
        <SidebarHeader className='border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
          <SiteHeader />
        </SidebarHeader>
        <div className='p-4'>
          <Suspense fallback={<Loading />}>{useRoutes(routes)}</Suspense>
        </div>
        <Toaster position='top-right' richColors />
      </SidebarInset>
    </ThemeProvider>
  )
}

function Loading() {
  return (
    <div className='w-full h-screen flex items-center justify-center px-4'>
      <div className='flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in-50 duration-500'>
        {/* 简单的内容预览 */}
        <div className='w-full space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center gap-3 p-3 rounded-lg border bg-card/50'>
              <Skeleton className='h-8 w-8 rounded-full flex-shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-3 w-3/4' />
                <Skeleton className='h-2 w-1/2' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
