'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  unreadCount?: number
}

export function Header({ unreadCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-end gap-2 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black px-6">
      <ThemeToggle />

      <Link href="/notifications" className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />
        )}
      </Link>

      <UserMenu />
    </header>
  )
}
