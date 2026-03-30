export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

export const parseCurrencyInput = (value: string): number => {
  const numericStr = value.replace(/\D/g, '')
  if (!numericStr) return 0
  return parseInt(numericStr, 10) / 100
}
