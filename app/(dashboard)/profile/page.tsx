import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile information</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
        <User className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-3" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile editor coming soon</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Coming in Milestone 10</p>
      </div>
    </div>
  )
}
