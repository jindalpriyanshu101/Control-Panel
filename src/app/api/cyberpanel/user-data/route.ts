/**
 * User-specific CyberPanel data API
 * Returns data filtered by user permissions and ownership
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { cyberPanelRequest } from '../../../../lib/cyberpanel'
import { getUserWebsites, isUserAdmin } from '../../../../lib/userService'

interface UserSpecificData {
  user: {
    username: string
    role: string
    websiteCount: number
  }
  websites: Array<{
    domain: string
    package: string
    state: string
    diskUsed: string
    ipAddress: string
  }>
  packages: Array<{
    packageName: string
    allowedDomains: number
    diskSpace: number
    bandwidth: number
    emailAccounts: number
    dataBases: number
    ftpAccounts: number
  }>
  stats: {
    totalWebsites: number
    activeWebsites: number
    totalDiskUsage: string
    availablePackages: number
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 Fetching user-specific CyberPanel data...')
    
    // Get authenticated session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.name) {
      console.log('❌ No authenticated session found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const username = session.user.name
    console.log(`👤 Fetching data for user: ${username}`)

    // Check if user is admin (admins can see all data)
    const isAdmin = await isUserAdmin(username)
    console.log(`🔐 User ${username} is admin: ${isAdmin}`)

    // Fetch websites data
    const websitesResponse = await cyberPanelRequest('fetchWebsites', {
      page: 1,
      recordsToShow: 100
    })

    if (!websitesResponse.status || !websitesResponse.data) {
      throw new Error('Failed to fetch websites from CyberPanel')
    }

    // Parse websites data
    const websitesData = typeof websitesResponse.data === 'string' 
      ? JSON.parse(websitesResponse.data) 
      : websitesResponse.data

    // Filter websites based on user permissions
    let userWebsites = websitesData
    
    if (!isAdmin) {
      // Non-admin users only see their own websites
      const userManagedWebsites = await getUserWebsites(username)
      userWebsites = websitesData.filter((site: any) => 
        userManagedWebsites.includes(site.domain) || site.admin === username
      )
      console.log(`🔒 Filtered to ${userWebsites.length} websites for user ${username}`)
    } else {
      console.log(`🔓 Admin user ${username} can see all ${userWebsites.length} websites`)
    }

    // Fetch packages data
    const packagesResponse = await cyberPanelRequest('fetchPackages', {})
    
    if (!packagesResponse.status || !packagesResponse.data) {
      throw new Error('Failed to fetch packages from CyberPanel')
    }

    const packagesData = typeof packagesResponse.data === 'string' 
      ? JSON.parse(packagesResponse.data) 
      : packagesResponse.data

    // Calculate stats
    const activeWebsites = userWebsites.filter((site: any) => 
      site.state === 'Active'
    ).length

    const totalDiskUsage = userWebsites.reduce((total: number, site: any) => {
      const diskUsed = parseInt(site.diskUsed?.replace(/[^\d]/g, '') || '0')
      return total + diskUsed
    }, 0)

    // Prepare response data
    const responseData: UserSpecificData = {
      user: {
        username,
        role: isAdmin ? 'admin' : 'user',
        websiteCount: userWebsites.length
      },
      websites: userWebsites.map((site: any) => ({
        domain: site.domain,
        package: site.package,
        state: site.state,
        diskUsed: site.diskUsed || '0MB',
        ipAddress: site.ipAddress
      })),
      packages: packagesData,
      stats: {
        totalWebsites: userWebsites.length,
        activeWebsites,
        totalDiskUsage: `${totalDiskUsage}MB`,
        availablePackages: packagesData.length
      }
    }

    console.log(`✅ Successfully fetched user-specific data for ${username}:`, {
      websites: responseData.websites.length,
      packages: responseData.packages.length,
      role: responseData.user.role
    })

    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('❌ Error fetching user-specific CyberPanel data:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch CyberPanel data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
