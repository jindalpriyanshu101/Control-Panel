import { NextRequest, NextResponse } from 'next/server'
import { cyberPanelRequest } from '../../../lib/cyberpanel'

export async function GET(request: NextRequest) {
  try {
    console.log('=== STATUS CHECK ENDPOINT ===')
    
    // Test CyberPanel API
    console.log('Testing CyberPanel API...')
    const cyberPanelTest = await cyberPanelRequest('verifyLogin')
    
    console.log('CyberPanel Test Result:', cyberPanelTest)
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        nextAuth: 'running',
        cyberPanel: {
          status: cyberPanelTest.status ? 'connected' : 'failed',
          error: cyberPanelTest.error || null,
          response: cyberPanelTest
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        cyberPanelUrl: process.env.CYBERPANEL_URL,
        cyberPanelUsername: process.env.CYBERPANEL_USERNAME,
        cyberPanelPasswordSet: !!process.env.CYBERPANEL_PASSWORD,
        cyberPanelTokenSet: !!process.env.CYBERPANEL_TOKEN,
        cyberPanelTokenLength: process.env.CYBERPANEL_TOKEN?.length || 0
      }
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
