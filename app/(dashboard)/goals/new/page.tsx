import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GoalCreationWizard } from '@/components/goals/GoalCreationWizard'

export default function NewGoalPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <Link href="/goals" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Goals
        </Link>
        <h1 className="text-2xl font-semibold text-black dark:text-white">Create Goal</h1>
      </div>
      <GoalCreationWizard />
    </div>
  )
}
