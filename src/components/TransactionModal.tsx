import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance, Transaction, TransactionType } from '@/contexts/FinanceContext'
import { formatCurrency, parseCurrencyInput } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transactionToEdit?: Transaction | null
}

const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  expense: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'],
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { addTransaction, editTransaction } = useFinance()
  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type)
        setDescription(transactionToEdit.description)
        setAmountInput(formatCurrency(transactionToEdit.amount))
        setDate(transactionToEdit.date.split('T')[0])
        setCategory(transactionToEdit.category)
      } else {
        setType('expense')
        setDescription('')
        setAmountInput('')
        setDate(new Date().toISOString().split('T')[0])
        setCategory('')
      }
    }
  }, [isOpen, transactionToEdit])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseCurrencyInput(e.target.value)
    setAmountInput(formatCurrency(val))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseCurrencyInput(amountInput)
    if (!description || amount <= 0 || !category) return

    const data = { type, description, amount, date: new Date(date).toISOString(), category }

    if (transactionToEdit) {
      editTransaction({ ...data, id: transactionToEdit.id })
    } else {
      addTransaction(data)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para {transactionToEdit ? 'atualizar a' : 'adicionar uma'}{' '}
            transação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              type="button"
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                type === 'income'
                  ? 'bg-white shadow text-success'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => {
                setType('income')
                setCategory('')
              }}
            >
              Entrada
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                type === 'expense'
                  ? 'bg-white shadow text-destructive'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => {
                setType('expense')
                setCategory('')
              }}
            >
              Saída
            </button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
