import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/lib/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'
import { unstable_cache } from '@/lib/unstable-cache'

type CurrentUser = {
  id: string
  email: string | null
  profile: {
    id: string
    email: string
    createdAt: Date | null
  } | null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const userId = session.user.id
  const userEmail = session.user.email ?? null

  // Cache user profile lookup - user profiles change infrequently
  const getProfile = unstable_cache(
    async () =>
      db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ['user-profile', userId],
    { revalidate: 600 }, // 10 minutes - user profiles don't change often
  )

  const profile = await getProfile()

  return {
    id: userId,
    email: userEmail,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          createdAt: profile.createdAt,
        }
      : null,
  }
}

