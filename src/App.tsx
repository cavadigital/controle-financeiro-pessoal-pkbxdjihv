import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { FinanceProvider } from './contexts/FinanceContext'
import { AuthProvider } from './contexts/AuthContext'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <FinanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/transacoes" element={<Transactions />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </FinanceProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
