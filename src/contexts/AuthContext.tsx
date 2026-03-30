import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<boolean>
  register: (name: string, email: string, pass: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const session = localStorage.getItem('mock_session')
    if (session) {
      try {
        const u = JSON.parse(session)
        setUser(u)
      } catch (e) {
        console.error('Failed to parse session', e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    const usersStr = localStorage.getItem('mock_users')
    const users = usersStr ? JSON.parse(usersStr) : []
    const found = users.find((u: any) => u.email === email && u.password === pass)

    if (found) {
      const u = { id: found.id, name: found.name, email: found.email }
      setUser(u)
      localStorage.setItem('mock_session', JSON.stringify(u))
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta, ${u.name}!`,
      })
      return true
    }
    return false
  }

  const register = async (name: string, email: string, pass: string) => {
    const usersStr = localStorage.getItem('mock_users')
    const users = usersStr ? JSON.parse(usersStr) : []

    if (users.find((u: any) => u.email === email)) {
      throw new Error('E-mail já cadastrado')
    }

    const newUser = { id: Date.now().toString(), name, email, password: pass }
    users.push(newUser)
    localStorage.setItem('mock_users', JSON.stringify(users))

    const u = { id: newUser.id, name: newUser.name, email: newUser.email }
    setUser(u)
    localStorage.setItem('mock_session', JSON.stringify(u))
    toast({
      title: 'Conta criada com sucesso',
      description: `Bem-vindo, ${u.name}!`,
    })
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mock_session')
    navigate('/login')
    toast({
      title: 'Logout realizado',
      description: 'Você saiu da sua conta com segurança.',
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
