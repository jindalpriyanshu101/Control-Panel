'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import AdminDashboard from '../../components/AdminDashboard'
import UserDashboard from '../../components/UserDashboard'

export default function Dashboard() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      redirect('/auth/signin')
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Check if user is admin
  const isAdmin = session.user?.email === 'admin@cyberpanel.local' || 
                  session.user?.email === 'admin@elementix.com' ||
                  // You can add role checking here when you implement it in your user model
                  true // For now, always show admin dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {isAdmin ? (
        <AdminDashboard user={session.user || { name: 'Admin', email: 'admin@cyberpanel.local', image: null }} />
      ) : (
        <UserDashboard user={session.user || { name: 'User', email: 'user@test.com', image: null }} />
      )}
    </div>
  )
}
