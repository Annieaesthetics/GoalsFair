import { Sidebar } from '@/components/shared/Sidebar'
import { Header } from '@/components/shared/Header'
import { FloatingAIButton } from '@/components/ai/agent/FloatingAIButton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <div className="lg:pl-56">
        <Header />
        <main className="px-8 py-8">{children}</main>
      </div>
      <FloatingAIButton />
    </div>
  )
}
