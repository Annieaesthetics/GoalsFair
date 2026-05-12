'use client'

import { useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  transaction_type: string | null
  description: string | null
  transaction_date: string | null
  created_at: string | null
}

interface TransactionLogProps {
  transactions: Transaction[]
}

const PAGE_SIZE = 10

export function TransactionLog({ transactions }: TransactionLogProps) {
  const [page, setPage] = useState(1)

  const paginated = transactions.slice(0, page * PAGE_SIZE)
  const hasMore = transactions.length > page * PAGE_SIZE

  if (transactions.length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-600 py-4">No transactions yet.</p>
    )
  }

  return (
    <div className="space-y-0">
      {paginated.map(tx => {
        const isDeposit = tx.transaction_type !== 'withdrawal'
        return (
          <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-950 last:border-0">
            <div className={`shrink-0 ${isDeposit ? 'text-emerald-600' : 'text-red-500'}`}>
              {isDeposit
                ? <ArrowUpCircle className="w-4 h-4" />
                : <ArrowDownCircle className="w-4 h-4" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-black dark:text-white truncate">
                {tx.description || (isDeposit ? 'Deposit' : 'Withdrawal')}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-600">
                {tx.transaction_date
                  ? new Date(tx.transaction_date + 'T00:00:00').toLocaleDateString()
                  : tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''
                }
              </div>
            </div>
            <div className={`text-sm font-medium shrink-0 ${isDeposit ? 'text-emerald-600' : 'text-red-500'}`}>
              {isDeposit ? '+' : '-'}${Number(tx.amount).toLocaleString()}
            </div>
          </div>
        )
      })}

      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  )
}
