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

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: {
        websites: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate user statistics
    const totalWebsites = user.websites.length
    const activeWebsites = user.websites.filter(w => w.status === 'ACTIVE').length
    
    const totalStorageUsed = user.websites.reduce((sum, site) => sum + site.storageUsed, 0)
    const totalStorageLimit = user.websites.reduce((sum, site) => sum + site.storageLimit, 0)
    const totalBandwidthUsed = user.websites.reduce((sum, site) => sum + site.bandwidthUsed, 0)
    const totalVisitors = user.websites.reduce((sum, site) => sum + site.visitorsCount, 0)

    // Get user's recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    const stats = {
      totalWebsites,
      activeWebsites,
      totalStorage: `${Math.round(totalStorageLimit / 1024)} GB`,
      usedStorage: `${Math.round(totalStorageUsed / 1024)} GB`,
      bandwidth: `${Math.round(totalBandwidthUsed / 1024)} GB`,
      thisMonthVisitors: totalVisitors
    }

    const websites = user.websites.map(website => ({
      id: website.id,
      domain: website.domain,
      status: website.status.toLowerCase(),
      plan: website.package,
      storage: `${Math.round(website.storageUsed / 1024 * 100) / 100} GB`,
      bandwidth: `${Math.round(website.bandwidthUsed / 1024 * 100) / 100} GB`,
      visitors: website.visitorsCount,
      created: website.createdAt.toISOString().split('T')[0],
      sslEnabled: website.sslEnabled,
      phpVersion: website.phpVersion
    }))

    const activities = recentActivities.map(activity => ({
      action: activity.action,
      description: activity.description,
      time: activity.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats,
        websites,
        activities
      }
    })

  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
