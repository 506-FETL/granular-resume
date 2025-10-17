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
    <div className='w-full h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-muted/20'>
      <div className='flex flex-col space-y-8 w-full max-w-2xl animate-in fade-in-50 duration-500'>
        {/* 主卡片骨架 */}
        <div className='relative'>
          <Skeleton className='h-64 w-full rounded-2xl shadow-sm' />
          <div className='absolute top-4 left-4 flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-24' />
            </div>
          </div>
        </div>

        {/* 内容块骨架 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4 p-6 rounded-xl border bg-card shadow-sm'>
            <Skeleton className='h-6 w-40 rounded-lg' />
            <div className='space-y-2.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-11/12' />
              <Skeleton className='h-4 w-4/5' />
            </div>
          </div>

          <div className='space-y-4 p-6 rounded-xl border bg-card shadow-sm'>
            <Skeleton className='h-6 w-32 rounded-lg' />
            <div className='space-y-2.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-10/12' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </div>
        </div>

        {/* 列表项骨架 */}
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center gap-4 p-4 rounded-lg border bg-card shadow-sm'>
              <Skeleton className='h-10 w-10 rounded-full flex-shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
              <Skeleton className='h-8 w-20 rounded-md' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
