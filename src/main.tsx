import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { ThemeProvider } from './providers/ThemeProvider'
import { SourceProvider } from './context/SourceContext'
import { HiddenProvider } from './context/HiddenContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SourceProvider>
          <HiddenProvider>
            <App />
          </HiddenProvider>
        </SourceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
