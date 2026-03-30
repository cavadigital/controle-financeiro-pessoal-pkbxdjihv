import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Check, Trash2, Users } from 'lucide-react'

export default function AdminUsers() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [usersList, setUsersList] = useState<any[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const usersStr = localStorage.getItem('mock_users')
    if (usersStr) {
      const parsed = JSON.parse(usersStr)
      setUsersList(parsed.filter((u: any) => u.id !== user?.id))
    }
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleApprove = (id: string) => {
    const usersStr = localStorage.getItem('mock_users')
    if (usersStr) {
      const parsed = JSON.parse(usersStr)
      const updated = parsed.map((u: any) => (u.id === id ? { ...u, status: 'approved' } : u))
      localStorage.setItem('mock_users', JSON.stringify(updated))
      setUsersList(updated.filter((u: any) => u.id !== user?.id))
      toast({
        title: 'Usuário aprovado',
        description: 'O usuário agora tem acesso ao sistema.',
      })
    }
  }

  const handleRemove = (id: string) => {
    const usersStr = localStorage.getItem('mock_users')
    if (usersStr) {
      const parsed = JSON.parse(usersStr)
      const updated = parsed.filter((u: any) => u.id !== id)
      localStorage.setItem('mock_users', JSON.stringify(updated))
      setUsersList(updated.filter((u: any) => u.id !== user?.id))
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi excluído do sistema.',
      })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Aprove ou remova o acesso de novos usuários ao sistema.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
                    <p>Nenhum outro usuário encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                usersList.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {u.status === 'approved' ? (
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 border-none font-medium"
                        >
                          Aprovado
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none font-medium"
                        >
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50 bg-green-50/50 h-8 px-3"
                            onClick={() => handleApprove(u.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            Aprovar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/20 hover:border-destructive/30 hover:text-destructive hover:bg-destructive/10 bg-destructive/5 h-8 px-3"
                          onClick={() => handleRemove(u.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
