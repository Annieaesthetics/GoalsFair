import Link from 'next/link'
import { ArrowRight, Target, Zap, TrendingUp, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-lg">Goals Fair</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-32">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-emerald-600 mb-6 tracking-wide uppercase">Goal tracking, reimagined</p>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8">
            Achieve what
            <br />
            <span className="text-emerald-600">matters most</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            Set goals, build habits, and track your progress — all in one beautifully simple platform.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-80 transition-opacity"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-900" />

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {[
            { icon: Target, color: 'text-emerald-600', label: 'Goal Tracking', desc: 'Track goals across 8 life categories with visual progress rings.' },
            { icon: Zap, color: 'text-lime-600', label: 'Habit Building', desc: 'Build streaks and consistency with smart daily reminders.' },
            { icon: TrendingUp, color: 'text-sky-600', label: 'AI Coaching', desc: 'Get personalized insights from AI powered by Anthropic and Mistral.' },
            { icon: Shield, color: 'text-orange-600', label: 'Private & Secure', desc: 'Your data is yours. End-to-end security with Supabase RLS.' },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div key={label} className="space-y-3">
              <Icon className={`w-6 h-6 ${color}`} />
              <h3 className="font-semibold">{label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-900" />

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="grid grid-cols-3 gap-8">
          {[
            { value: '8', label: 'Goal categories' },
            { value: '30+', label: 'Achievements to unlock' },
            { value: '3', label: 'AI models powering insights' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold mb-1">{value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-900" />

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold mb-4">Ready to start?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Free to use. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors"
          >
            Create your account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium">Goals Fair</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Goals Fair. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
