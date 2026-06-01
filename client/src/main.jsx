import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ClerkProvider } from '@clerk/react'
import App from '@/App.jsx'
import '@/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey || !clerkPublishableKey.startsWith('pk_')) {
  createRoot(document.getElementById('root')).render(
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center select-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
      <div className="max-w-md w-full border border-red-500/20 bg-gradient-to-br from-[#241205] via-[#0c0602] to-[#000000] rounded-2xl p-8 shadow-exec-lg space-y-6">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 text-lg">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-red-400 font-display">Configuration Key Missing</h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            The application is missing a valid <strong>Clerk Publishable Key</strong> (<code>VITE_CLERK_PUBLISHABLE_KEY</code>) at build-time.
          </p>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl text-left text-[11px] font-mono text-neutral-300 space-y-2">
          <div>1. Add to root <code>.env</code>:</div>
          <div className="text-neutral-400 pl-3 select-all">CLERK_PUBLISHABLE_KEY=pk_test_...</div>
          <div className="pt-2">2. Rebuild the container:</div>
          <div className="text-neutral-400 pl-3">docker compose build --no-cache</div>
        </div>
      </div>
    </div>
  );
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#e0e5ec',
                  color: '#2d3748',
                  boxShadow: '6px 6px 12px #b8bec7, -6px -6px 12px #ffffff',
                  borderRadius: '16px',
                  padding: '14px 20px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#e0e5ec' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#e0e5ec' },
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    </StrictMode>,
  )
}
