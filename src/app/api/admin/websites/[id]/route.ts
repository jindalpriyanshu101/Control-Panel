import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { getCyberPanelAPI } from '../../../../../lib/cyberpanel'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const websiteId = params.id

    // Get website details first
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Delete from CyberPanel (if it exists there)
    try {
      const cyberPanelAPI = getCyberPanelAPI()
      await cyberPanelAPI.deleteWebsite(website.domain)
    } catch (cpError) {
      console.warn('CyberPanel deletion failed:', cpError)
      // Continue with database deletion even if CyberPanel fails
    }

    // Delete from database (this will cascade delete related records)
    await prisma.website.delete({
      where: { id: websiteId }
    })

    // Log the deletion activity
    await prisma.activity.create({
      data: {
        userId: website.userId,
        action: 'Website Deleted',
        description: `Website ${website.domain} was deleted by admin`,
        type: 'ADMIN_ACTION',
        metadata: {
          domain: website.domain,
          deletedBy: session.user?.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Website deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting website:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const websiteId = params.id
    const body = await request.json()
    const { status, package: packageName } = body

    // Update website
    const website = await prisma.website.update({
      where: { id: websiteId },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(packageName && { package: packageName })
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Log the update activity
    await prisma.activity.create({
      data: {
        userId: website.userId,
        action: 'Website Updated',
        description: `Website ${website.domain} was updated by admin`,
        type: 'ADMIN_ACTION',
        metadata: {
          domain: website.domain,
          updatedBy: session.user?.email,
          changes: body
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Website updated successfully',
      data: website
    })

  } catch (error) {
    console.error('Error updating website:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
