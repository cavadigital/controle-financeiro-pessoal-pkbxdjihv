import { useState } from 'react'
import { useFinance, Transaction } from '@/contexts/FinanceContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useToast } from '@/hooks/use-toast'
import { TransactionModal } from '@/components/TransactionModal'
import { cn } from '@/lib/utils'

export default function Transactions() {
  const { transactions, deleteTransaction } = useFinance()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const { toast } = useToast()

  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || tx.type === filter
    return matchesSearch && matchesFilter
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id)
      toast({
        title: 'Transação excluída',
        description: 'A transação foi removida com sucesso.',
      })
    }
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transações</h1>
      </div>

      <Card className="border-none shadow-soft p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>

          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(v) => v && setFilter(v as any)}
            className="justify-start"
          >
            <ToggleGroupItem value="all" aria-label="Todas">
              Todas
            </ToggleGroupItem>
            <ToggleGroupItem
              value="income"
              aria-label="Entradas"
              className="text-success data-[state=on]:bg-success/10 data-[state=on]:text-success"
            >
              Entradas
            </ToggleGroupItem>
            <ToggleGroupItem
              value="expense"
              aria-label="Saídas"
              className="text-destructive data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive"
            >
              Saídas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <Card
              key={tx.id}
              className="border-none shadow-soft p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                    tx.type === 'income'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpCircle className="w-6 h-6" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="bg-muted px-2 py-0.5 rounded-full">{tx.category}</span>
                    <span>•</span>
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                <div
                  className={cn(
                    'font-bold tabular-nums text-lg',
                    tx.type === 'income' ? 'text-success' : 'text-destructive',
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(tx)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tx.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">
            <p className="text-lg font-medium text-slate-700">Nenhuma transação encontrada</p>
            <p className="text-sm mt-1">Tente ajustar seus filtros ou adicione uma nova entrada.</p>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTx(null)
        }}
        transactionToEdit={editingTx}
      />
    </div>
  )
}
