import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { getCyberPanelAPI } from '../../../../lib/cyberpanel'
import { prisma } from '../../../../lib/db'

// Helper functions for plan limits
function getStorageLimit(plan: string): number {
  const limits: { [key: string]: number } = {
    'starter': 10 * 1024, // 10GB in MB
    'professional': 100 * 1024, // 100GB in MB
    'enterprise': 1000 * 1024, // 1TB in MB
    'basic': 50 * 1024 // 50GB in MB
  }
  return limits[plan?.toLowerCase()] || limits['basic']
}

function getBandwidthLimit(plan: string): number {
  const limits: { [key: string]: number } = {
    'starter': 100 * 1024, // 100GB in MB
    'professional': 1000 * 1024, // 1TB in MB
    'enterprise': 10000 * 1024, // 10TB in MB
    'basic': 500 * 1024 // 500GB in MB
  }
  return limits[plan?.toLowerCase()] || limits['basic']
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { domain, owner, plan, phpVersion, sslEnabled } = body

    // Validate required fields
    if (!domain || !owner) {
      return NextResponse.json({ error: 'Domain and owner are required' }, { status: 400 })
    }

    // Create website using CyberPanel API
    const cyberPanelAPI = getCyberPanelAPI()
    const result = await cyberPanelAPI.createWebsite({
      domainName: domain,
      ownerEmail: owner,
      packageName: plan || 'Default',
      websiteOwner: owner
    })

    if (result.status !== 'success') {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    // Find the user who will own this website
    const ownerUser = await prisma.user.findUnique({
      where: { email: owner }
    })

    if (!ownerUser) {
      return NextResponse.json({ error: 'Owner user not found' }, { status: 400 })
    }

    // Save website to database
    const website = await prisma.website.create({
      data: {
        domain,
        userId: ownerUser.id,
        package: plan || 'Basic',
        status: 'ACTIVE',
        phpVersion: phpVersion || '8.1',
        sslEnabled: sslEnabled || false,
        cyberpanelId: result.websiteId,
        ipAddress: result.ipAddress,
        storageLimit: getStorageLimit(plan),
        bandwidthLimit: getBandwidthLimit(plan)
      }
    })

    // If SSL is enabled, install SSL certificate
    if (sslEnabled) {
      try {
        await cyberPanelAPI.installSSL({
          domainName: domain,
          email: owner
        })
      } catch (sslError) {
        console.warn('SSL installation failed:', sslError)
        // Don't fail the entire request if SSL fails
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: ownerUser.id,
        action: 'Website Created',
        description: `Website ${domain} created successfully`,
        type: 'ADMIN_ACTION',
        metadata: {
          domain,
          plan,
          phpVersion,
          sslEnabled
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Website created successfully',
      data: {
        domain,
        owner,
        plan,
        phpVersion,
        sslEnabled,
        websiteId: result.websiteId,
        ipAddress: result.ipAddress
      }
    })

  } catch (error) {
    console.error('Error creating website:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

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

    // Get all websites from database with user information
    const websites = await prisma.website.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedWebsites = websites.map(website => ({
      id: website.id,
      domain: website.domain,
      status: website.status.toLowerCase(),
      owner: website.user.email,
      plan: website.package,
      created: website.createdAt.toISOString().split('T')[0],
      storageUsed: `${Math.round(website.storageUsed / 1024 * 100) / 100} GB`,
      bandwidthUsed: `${Math.round(website.bandwidthUsed / 1024 * 100) / 100} GB`,
      visitorsCount: website.visitorsCount,
      sslEnabled: website.sslEnabled,
      phpVersion: website.phpVersion
    }))

    return NextResponse.json({
      success: true,
      data: formattedWebsites
    })

  } catch (error) {
    console.error('Error fetching websites:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
