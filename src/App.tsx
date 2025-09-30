import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from '~react-pages'
import { ThemeProvider } from '@/components/theme-provider'
import { AppSidebar } from './components/dashboard/app-sidebar'
import { SiteHeader } from './components/dashboard/site-header'
import { SidebarInset } from './components/ui/sidebar'

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="p-4">
            {useRoutes(routes)}
          </div>
        </SidebarInset>
      </ThemeProvider>
    </Suspense>
  )
}

export default App
