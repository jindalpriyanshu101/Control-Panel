import { NextRequest, NextResponse } from 'next/server'
import { cyberPanelRequest, fetchCyberPanelWebsites, fetchCyberPanelPackages, fetchCyberPanelUsers, fetchCyberPanelChildUsers } from '../../../../lib/cyberpanel'

export async function GET(request: NextRequest) {
  try {
    // Test CyberPanel connection first
    const connectionTest = await cyberPanelRequest('verifyLogin')
    
    if (!connectionTest.status) {
      console.log('CyberPanel connection failed, using mock data')
      return NextResponse.json(getMockData())
    }

    // Fetch real data from CyberPanel
    const [websitesResult, packagesResult] = await Promise.all([
      fetchCyberPanelWebsites(1, 100), // Fetch first 100 websites
      fetchCyberPanelPackages()
    ])

    // Transform CyberPanel data to our format
    const websitesData = websitesResult?.data ? JSON.parse(websitesResult.data) : []
    const websites = websitesData.map((site: any) => ({
      id: site.domain || site.websiteName || site.name,
      domain: site.domain || site.websiteName || site.name,
      status: site.state === 'Suspended' ? 'suspended' : 'active',
      owner: site.admin || 'admin',
      created: site.created || new Date().toISOString(),
      plan: site.package || 'Default',
      diskUsed: parseInt(site.diskUsed?.replace('MB', '')) || 0,
      diskLimit: 1000, // Default limit, could be fetched from package data
      bandwidthUsed: parseInt(site.monthlyBandwidthUsage) || 0,
      bandwidthLimit: 1000, // Default limit, could be fetched from package data
      phpVersion: site.phpVersion || '8.1',
      ssl: site.ssl === 'Yes' || site.sslIssued || false
    })) || []

    const packagesData = packagesResult?.data ? JSON.parse(packagesResult.data) : []
    const packages = packagesData.map((pkg: any) => ({
      id: pkg.packageName || pkg.name,
      name: pkg.packageName || pkg.name,
      description: pkg.description || `Package: ${pkg.packageName || pkg.name}`,
      price: 0, // CyberPanel doesn't have pricing in API
      features: [
        `${pkg.diskSpace || '1000'} MB Disk Space`,
        `${pkg.bandwidth || '1000'} MB Bandwidth`,
        `${pkg.emailAccounts || 'Unlimited'} Email Accounts`,
        `${pkg.dataBases || 'Unlimited'} Databases`,
        `${pkg.ftpAccounts || 'Unlimited'} FTP Accounts`
      ],
      limits: {
        websites: parseInt(pkg.allowedDomains) || 1,
        emailAccounts: parseInt(pkg.emailAccounts) || -1,
        databases: parseInt(pkg.dataBases) || -1,
        bandwidth: parseInt(pkg.bandwidth) || 1000,
        storage: parseInt(pkg.diskSpace) || 1000
      }
    })) || []

    // Generate stats from real data
    const stats = {
      totalUsers: 1, // Will be updated when we have real user data
      totalWebsites: websites.length,
      activeWebsites: websites.filter(w => w.status === 'active').length,
      suspendedWebsites: websites.filter(w => w.status === 'suspended').length,
      totalBandwidth: websites.reduce((sum, w) => sum + w.bandwidthUsed, 0),
      totalStorage: websites.reduce((sum, w) => sum + w.diskUsed, 0),
      totalPackages: packages.length
    }

    // Extract users from website data since dedicated user endpoints may not be available
    let users: any[] = []
    
    try {
      // Get unique users from website data (only actual admin users, not emails)
      const userMap = new Map()
      
      for (const site of websitesData) {
        const admin = site.admin || 'admin'
        const email = site.adminEmail || `${admin}@cyberpanel.local`
        
        if (!userMap.has(admin)) {
          userMap.set(admin, {
            id: admin,
            name: admin === 'admin' ? 'Administrator' : admin.charAt(0).toUpperCase() + admin.slice(1),
            email: email,
            role: admin === 'admin' ? 'admin' : 'user',
            websites: 0,
            created: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            status: 'active'
          })
        }
        
        // Count websites for each user
        userMap.get(admin).websites += 1
      }
      
      users = Array.from(userMap.values())
      
      // Update stats with real user count
      stats.totalUsers = users.length || 1
      
    } catch (error) {
      console.error('Error extracting user data from websites:', error)
      
      // Fallback to mock admin user if user extraction fails
      users = [
        {
          id: 'admin',
          name: 'Administrator',
          email: 'admin@cyberpanel.local',
          role: 'admin',
          websites: websites.length,
          created: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'active'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: {
        websites,
        users,
        packages,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching CyberPanel data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch CyberPanel data',
      data: getMockData()
    })
  }
}

function getMockData() {
  return {
    websites: [
      {
        id: 'example.com',
        domain: 'example.com',
        status: 'active',
        owner: 'admin',
        created: new Date().toISOString(),
        plan: 'Default',
        diskUsed: 150,
        diskLimit: 1000,
        bandwidthUsed: 250,
        bandwidthLimit: 1000,
        phpVersion: '8.1',
        ssl: true
      }
    ],
    users: [
      {
        id: 'admin',
        name: 'Administrator',
        email: 'admin@cyberpanel.local',
        role: 'admin',
        websites: 1,
        created: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active'
      }
    ],
    packages: [
      {
        id: 'default',
        name: 'Default',
        description: 'Default hosting package',
        price: 0,
        features: [
          '1000 MB Disk Space',
          '1000 MB Bandwidth',
          'Unlimited Email Accounts',
          'Unlimited Databases'
        ],
        limits: {
          websites: 1,
          emailAccounts: -1,
          databases: -1,
          bandwidth: 1000,
          storage: 1000
        }
      }
    ],
    stats: {
      totalUsers: 1,
      totalWebsites: 1,
      activeWebsites: 1,
      suspendedWebsites: 0,
      totalBandwidth: 250,
      totalStorage: 150,
      totalPackages: 1
    }
  }
}
