import React, { createContext, useContext, useEffect, useState } from 'react'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  date: string
  category: string
  isRecurrent?: boolean
  installment?: {
    current: number
    total: number
  }
  isPaid?: boolean
  paidMonths?: string[]
}

interface FinanceContextData {
  transactions: Transaction[]
  currentMonthTransactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  addTransactions: (ts: Omit<Transaction, 'id'>[]) => void
  editTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  toggleTransactionPaid: (id: string, dateStr: string) => void
  totalIncome: number
  totalExpense: number
  balance: number
  selectedMonth: Date
  setSelectedMonth: (date: Date) => void
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData)

const MOCK_DATA: Transaction[] = [
  {
    id: '1',
    type: 'income',
    description: 'Salário',
    amount: 5000,
    date: new Date().toISOString(),
    category: 'Salário',
    isRecurrent: true,
  },
  {
    id: '2',
    type: 'expense',
    description: 'Aluguel',
    amount: 1500,
    date: new Date().toISOString(),
    category: 'Moradia',
    isRecurrent: true,
  },
  {
    id: '3',
    type: 'expense',
    description: 'Supermercado',
    amount: 800,
    date: new Date().toISOString(),
    category: 'Alimentação',
  },
  {
    id: '4',
    type: 'expense',
    description: 'Notebook em 10x',
    amount: 350,
    date: new Date().toISOString(),
    category: 'Outros',
    installment: {
      current: 1,
      total: 10,
    },
  },
]

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())

  useEffect(() => {
    const stored = localStorage.getItem('@meusaldo:transactions')
    if (stored) {
      setTransactions(JSON.parse(stored))
    } else {
      setTransactions(MOCK_DATA)
      localStorage.setItem('@meusaldo:transactions', JSON.stringify(MOCK_DATA))
    }
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('@meusaldo:transactions', JSON.stringify(transactions))
    } else {
      localStorage.removeItem('@meusaldo:transactions')
      localStorage.setItem('@meusaldo:transactions', JSON.stringify([]))
    }
  }, [transactions])

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx = { ...t, id: crypto.randomUUID() }
    setTransactions((prev) =>
      [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    )
  }

  const addTransactions = (ts: Omit<Transaction, 'id'>[]) => {
    const newTxs = ts.map((t) => ({ ...t, id: crypto.randomUUID() }))
    setTransactions((prev) =>
      [...newTxs, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    )
  }

  const editTransaction = (t: Transaction) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? t : tx)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }

  const toggleTransactionPaid = (id: string, dateStr: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        const isVirtual = id.includes('-virtual-')
        const baseId = isVirtual ? id.split('-virtual-')[0] : id

        if (tx.id !== baseId) return tx

        if (isVirtual) {
          const d = new Date(dateStr)
          const monthKey = `${d.getFullYear()}-${d.getMonth()}`
          const paidMonths = tx.paidMonths || []
          const isCurrentlyPaid = paidMonths.includes(monthKey)

          return {
            ...tx,
            paidMonths: isCurrentlyPaid
              ? paidMonths.filter((m) => m !== monthKey)
              : [...paidMonths, monthKey],
          }
        } else {
          return { ...tx, isPaid: !tx.isPaid }
        }
      }),
    )
  }

  const currentMonthTransactions = transactions.flatMap((t) => {
    const txDate = new Date(t.date)
    const target = selectedMonth
    const isThisMonth =
      txDate.getMonth() === target.getMonth() && txDate.getFullYear() === target.getFullYear()

    if (isThisMonth) return [t]

    if (t.isRecurrent) {
      const txMonthValue = txDate.getFullYear() * 12 + txDate.getMonth()
      const targetMonthValue = target.getFullYear() * 12 + target.getMonth()
      if (txMonthValue < targetMonthValue) {
        const monthKey = `${target.getFullYear()}-${target.getMonth()}`
        return [
          {
            ...t,
            id: `${t.id}-virtual-${targetMonthValue}`,
            date: new Date(
              target.getFullYear(),
              target.getMonth(),
              txDate.getDate(),
              12,
              0,
              0,
            ).toISOString(),
            isPaid: t.paidMonths?.includes(monthKey) || false,
          },
        ]
      }
    }
    return []
  })

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        currentMonthTransactions,
        addTransaction,
        addTransactions,
        editTransaction,
        deleteTransaction,
        toggleTransactionPaid,
        totalIncome,
        totalExpense,
        balance,
        selectedMonth,
        setSelectedMonth,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
