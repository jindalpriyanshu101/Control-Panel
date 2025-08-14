import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { deleteWebsiteCyberPanel } from '../../../../../lib/cyberpanel'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ 
        error: 'Domain parameter is required' 
      }, { status: 400 })
    }

    // Delete website from CyberPanel
    const result = await deleteWebsiteCyberPanel(domain)
    
    if (!result.status) {
      return NextResponse.json({ 
        error: 'Failed to delete website from CyberPanel',
        details: result.error 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Website ${domain} deleted successfully`,
      data: result
    })

  } catch (error) {
    console.error('Error deleting website:', error)
    return NextResponse.json({ 
      error: 'Failed to delete website',
      details: error.message 
    }, { status: 500 })
  }
}
