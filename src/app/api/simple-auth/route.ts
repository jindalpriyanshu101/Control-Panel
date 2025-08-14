import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const username = body.get('username') as string
    const password = body.get('password') as string
    
    console.log('=== AUTHENTICATION TEST ===')
    console.log('Received username:', username)
    console.log('Received password length:', password?.length)
    console.log('Environment password:', process.env.CYBERPANEL_PASSWORD)
    console.log('Environment password length:', process.env.CYBERPANEL_PASSWORD?.length)
    console.log('Username match (admin):', username === 'admin')
    console.log('Password match:', password === process.env.CYBERPANEL_PASSWORD)
    console.log('===============================')
    
    if (username === 'admin' && password === process.env.CYBERPANEL_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        message: 'Authentication successful!',
        redirect: '/dashboard'
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid credentials' 
    }, { status: 401 })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 })
  }
}
