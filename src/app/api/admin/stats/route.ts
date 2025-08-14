import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = session.user?.email === 'admin@elementix.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get real statistics from database
    const totalUsers = await prisma.user.count()
    const totalWebsites = await prisma.website.count()
    const activeWebsites = await prisma.website.count({
      where: { status: 'ACTIVE' }
    })

    // Calculate storage usage
    const websites = await prisma.website.findMany({
      select: {
        storageUsed: true,
        storageLimit: true,
        bandwidthUsed: true
      }
    })

    const totalStorageUsed = websites.reduce((sum, site) => sum + site.storageUsed, 0)
    const totalStorageLimit = websites.reduce((sum, site) => sum + site.storageLimit, 0)
    const totalBandwidthUsed = websites.reduce((sum, site) => sum + site.bandwidthUsed, 0)

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    const stats = {
      totalUsers,
      totalWebsites,
      activeWebsites,
      totalStorage: `${Math.round(totalStorageLimit / 1024)} GB`,
      usedStorage: `${Math.round(totalStorageUsed / 1024)} GB`,
      bandwidth: `${Math.round(totalBandwidthUsed / 1024)} GB`,
      recentActivities: recentActivities.map(activity => ({
        action: activity.action,
        description: activity.description,
        user: activity.user.email,
        time: activity.createdAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
