'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, CheckSquare, Image,
  BarChart3, Share2, Bell, Settings, Trophy, Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Agent', href: '/ai', icon: Brain },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Habits', href: '/habits', icon: CheckSquare },
  { name: 'Vision Board', href: '/vision', icon: Image },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Shared Boards', href: '/shared', icon: Share2 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-56 fixed inset-y-0 border-r border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-14 border-b border-gray-200 dark:border-gray-900">
        <Target className="w-4 h-4 text-emerald-600" />
        <span className="font-semibold text-sm">Goals Fair</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                isActive
                  ? 'bg-emerald-50 dark:bg-gray-900 text-emerald-700 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-950'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
