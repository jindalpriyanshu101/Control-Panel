import { NextResponse } from 'next/server'
import { verifyCyberPanelLogin } from '../../../../lib/cyberpanel'

export async function GET() {
  try {
    const result = await verifyCyberPanelLogin()
    
    if (result.status) {
      return NextResponse.json({ 
        success: true, 
        message: 'CyberPanel authentication successful',
        data: result
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'CyberPanel authentication failed',
        error: result.error 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('CyberPanel test error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to connect to CyberPanel',
      error: error.message 
    }, { status: 500 })
  }
}
