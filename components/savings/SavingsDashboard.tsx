'use client'

import { useState } from 'react'
import { SavingsGauge } from '@/components/savings/SavingsGauge'
import { AddTransactionForm } from '@/components/savings/AddTransactionForm'
import { TransactionLog } from '@/components/savings/TransactionLog'
import { SavingsChart } from '@/components/savings/SavingsChart'
import { FinancialProjections } from '@/components/savings/FinancialProjections'

interface Transaction {
  id: string
  amount: number
  transaction_type: string | null
  description: string | null
  transaction_date: string | null
  created_at: string | null
}

interface SavingsDashboardProps {
  goalId: string
  initialSavings: number
  target: number
  targetDate: string | null
  initialTransactions: Transaction[]
}

export function SavingsDashboard({ goalId, initialSavings, target, targetDate, initialTransactions }: SavingsDashboardProps) {
  const [savings, setSavings] = useState(initialSavings)
  const [transactions, setTransactions] = useState(initialTransactions)

  const handleNewTransaction = (tx: Transaction) => {
    const delta = tx.transaction_type === 'withdrawal' ? -tx.amount : tx.amount
    setSavings(s => Math.max(s + delta, 0))
    setTransactions(prev => [tx, ...prev])
  }

  return (
    <div className="space-y-8">
      {/* Gauge */}
      <SavingsGauge current={savings} target={target} />

      {/* Chart */}
      {transactions.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-black dark:text-white mb-3">Progress over time</h3>
          <SavingsChart transactions={transactions} target={target} />
        </div>
      )}

      {/* Projections */}
      {target > 0 && (
        <FinancialProjections current={savings} target={target} targetDate={targetDate} />
      )}

      {/* Add transaction */}
      <AddTransactionForm goalId={goalId} onSuccess={handleNewTransaction} />

      {/* Transaction history */}
      <div>
        <h3 className="text-sm font-medium text-black dark:text-white mb-3">
          Transaction History
          {transactions.length > 0 && (
            <span className="ml-2 text-xs text-gray-400 font-normal">{transactions.length} records</span>
          )}
        </h3>
        <TransactionLog transactions={transactions} />
      </div>
    </div>
  )
}
