import React, { createContext, useContext, useEffect, useState } from 'react'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  date: string
  category: string
}

interface FinanceContextData {
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  editTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  totalIncome: number
  totalExpense: number
  balance: number
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
  },
  {
    id: '2',
    type: 'expense',
    description: 'Aluguel',
    amount: 1500,
    date: new Date().toISOString(),
    category: 'Moradia',
  },
  {
    id: '3',
    type: 'expense',
    description: 'Supermercado',
    amount: 800,
    date: new Date().toISOString(),
    category: 'Alimentação',
  },
]

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

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
      localStorage.removeItem('@meusaldo:transactions') // clear if empty to show empty states correctly if needed, though saving empty array is fine too.
      localStorage.setItem('@meusaldo:transactions', JSON.stringify([]))
    }
  }, [transactions])

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx = { ...t, id: crypto.randomUUID() }
    setTransactions((prev) =>
      [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    )
  }

  const editTransaction = (t: Transaction) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? t : tx)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }

  const currentMonthTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date)
    const now = new Date()
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
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
        addTransaction,
        editTransaction,
        deleteTransaction,
        totalIncome,
        totalExpense,
        balance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
