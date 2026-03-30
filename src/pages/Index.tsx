import { useFinance } from '@/contexts/FinanceContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { useNumberTicker } from '@/hooks/useNumberTicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Repeat,
  CreditCard,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

export default function Index() {
  const { totalIncome, totalExpense, balance, currentMonthTransactions, toggleTransactionPaid } =
    useFinance()

  const animatedIncome = useNumberTicker(totalIncome)
  const animatedExpense = useNumberTicker(totalExpense)
  const animatedBalance = useNumberTicker(Math.abs(balance))

  const isPositive = balance >= 0
  const spentPercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0
  const statusColor = isPositive ? 'var(--success)' : 'var(--destructive)'

  const recentTransactions = [...currentMonthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const monthTransactionsSorted = [...currentMonthTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Aggregate for Pie Chart using current month projected transactions
  const expensesByCategory = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce(
      (acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const pieData = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    value: expensesByCategory[key],
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  const radialData = [{ name: 'Gastos', value: spentPercentage, fill: `hsl(${statusColor})` }]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-soft overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
            <ArrowUpCircle className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(animatedIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas</CardTitle>
            <ArrowDownCircle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(animatedExpense)}
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-none shadow-soft overflow-hidden group hover:shadow-md transition-all text-white relative',
            isPositive ? 'bg-success' : 'bg-destructive',
          )}
        >
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Saldo Total</CardTitle>
            <Wallet className="w-5 h-5 text-white" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold tabular-nums">
              {balance < 0 ? '-' : ''}
              {formatCurrency(animatedBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Status Indicator */}
        <Card className="border-none shadow-soft flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Saúde Financeira</h3>
          <div className="h-40 w-full mb-2">
            <ChartContainer
              config={{ target: { color: `hsl(${statusColor})` } }}
              className="h-full w-full"
            >
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                  fill="var(--color-target)"
                />
              </RadialBarChart>
            </ChartContainer>
          </div>
          <div className="flex items-center gap-2 mt-[-40px]">
            {isPositive ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            <span className={cn('font-medium', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? 'Você está no azul!' : 'Cuidado! Você está no vermelho'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Você gastou {spentPercentage.toFixed(0)}% das suas entradas.
          </p>
        </Card>

        {/* Expenses by Category */}
        <Card className="border-none shadow-soft p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Despesas por Categoria</h3>
          {pieData.length > 0 ? (
            <div className="h-[200px] w-full">
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Nenhuma despesa registrada no mês.
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="border-none shadow-soft p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Transações Recentes</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        tx.type === 'income'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpCircle className="w-5 h-5" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800 leading-none truncate max-w-[120px] sm:max-w-xs">
                          {tx.description}
                        </p>
                        {tx.isRecurrent && (
                          <Repeat className="w-3 h-3 text-purple-600" aria-label="Recorrente" />
                        )}
                        {tx.installment && (
                          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm border border-blue-100 leading-none">
                            {tx.installment.current}/{tx.installment.total}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums shrink-0 ml-2',
                      tx.type === 'income' ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center pb-4 text-muted-foreground">
              <p className="text-sm mb-2">Nada por aqui ainda.</p>
              <p className="text-xs">Comece adicionando sua primeira entrada!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Contas do Mês */}
      <div className="mt-8">
        <Card className="border-none shadow-soft overflow-hidden">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Contas do Mês</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {monthTransactionsSorted.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthTransactionsSorted.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className={cn(
                        'transition-all',
                        tx.isPaid && 'bg-muted/30 opacity-60 grayscale-[0.5]',
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={tx.isPaid || false}
                          onCheckedChange={() => toggleTransactionPaid(tx.id, tx.date)}
                          aria-label={`Marcar ${tx.description} como pago`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'font-medium',
                                tx.isPaid ? 'line-through text-muted-foreground' : 'text-slate-900',
                              )}
                            >
                              {tx.description}
                            </span>
                            {tx.isRecurrent && (
                              <Repeat
                                className="w-3 h-3 text-purple-600 shrink-0"
                                aria-label="Recorrente"
                              />
                            )}
                            {tx.installment && (
                              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm border border-blue-100 leading-none whitespace-nowrap">
                                {tx.installment.current}/{tx.installment.total}
                              </span>
                            )}
                          </div>
                          <div className="sm:hidden text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span>{tx.category}</span>
                            <span>&bull;</span>
                            <span>{formatDate(tx.date)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {tx.category}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium align-top sm:align-middle pt-5 sm:pt-4',
                          tx.type === 'income' ? 'text-success' : 'text-destructive',
                          tx.isPaid && 'opacity-70',
                        )}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nenhuma transação encontrada para este mês.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
