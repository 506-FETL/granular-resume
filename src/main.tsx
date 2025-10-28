import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorFallback from './components/ErrorBoundary'
import { SidebarProvider } from './components/ui/sidebar'
import './index.css'

const app = createRoot(document.getElementById('root')!)

app.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          <App />
        </SidebarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
