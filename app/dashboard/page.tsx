import { unstable_noStore } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/currentUser'
import DashboardContent from './components/DashboardContent'

export default async function DashboardPage() {
  unstable_noStore()
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen p-8 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as {currentUser.email ?? currentUser.id}
          </p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition"
          >
            Log out
          </button>
        </form>
      </div>
      <DashboardContent />
    </main>
  )
}

