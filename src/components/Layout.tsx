import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, ListOrdered, Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionModal } from './TransactionModal'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />

  const currentMonthName = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transações', path: '/transacoes', icon: ListOrdered },
  ]

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const userName = user.name ? user.name.split(' ')[0] : 'Usuário'

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white px-4 py-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
            {userInitial}
          </div>
          <span className="text-xl font-bold tracking-tight truncate max-w-[150px]">
            {userName}
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium',
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <header className="h-16 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Período Atual
            </span>
            <span className="text-sm font-semibold text-foreground">{capitalizedMonth}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full shadow-sm hover:shadow-md transition-all gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="md:hidden text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="p-4 md:p-8 animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2 pb-safe z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                )}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium mt-1',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
