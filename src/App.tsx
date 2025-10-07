import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from '~react-pages'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarHeader, SidebarInset } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AppSidebar variant="inset" />
      <SidebarInset className="relative overflow-hidden">
        <SidebarHeader className="">
          <SiteHeader />
        </SidebarHeader>
        <Suspense fallback={<Loading />}>
          <div className="p-4">
            {useRoutes(routes)}
          </div>
        </Suspense>
      </SidebarInset>
    </ThemeProvider>
  )
}

function Loading() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col space-y-6 w-full max-w-md">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export default App
