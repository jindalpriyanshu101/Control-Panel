import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    // This endpoint simulates updating website statistics
    // In a real application, this would be called by monitoring systems or CyberPanel webhooks
    
    const websites = await prisma.website.findMany()
    
    // Simulate random traffic and usage updates
    for (const website of websites) {
      if (website.status === 'ACTIVE') {
        // Simulate random visitor increase (0-100 new visitors)
        const newVisitors = Math.floor(Math.random() * 100)
        
        // Simulate random storage increase (0-10 MB)
        const newStorage = Math.floor(Math.random() * 10)
        
        // Simulate random bandwidth usage (0-50 MB)
        const newBandwidth = Math.floor(Math.random() * 50)
        
        await prisma.website.update({
          where: { id: website.id },
          data: {
            visitorsCount: website.visitorsCount + newVisitors,
            storageUsed: Math.min(website.storageUsed + newStorage, website.storageLimit),
            bandwidthUsed: website.bandwidthUsed + newBandwidth
          }
        })
      }
    }

    // Create a system activity log
    await prisma.activity.create({
      data: {
        userId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || '',
        action: 'Statistics Updated',
        description: 'Website statistics updated automatically',
        type: 'SYSTEM_ACTION'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Website statistics updated',
      updatedWebsites: websites.length
    })

  } catch (error) {
    console.error('Error updating statistics:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
