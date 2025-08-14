import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Test auth request:', body)
    
    const { username, password } = body
    
    // Check environment variables
    const envPassword = process.env.CYBERPANEL_PASSWORD
    console.log('Environment password exists:', !!envPassword)
    console.log('Environment password length:', envPassword?.length)
    console.log('Received password length:', password?.length)
    console.log('Username match:', username === 'admin')
    console.log('Password match:', password === envPassword)
    
    if (username === 'admin' && password === envPassword) {
      return NextResponse.json({ 
        success: true, 
        message: 'Authentication successful',
        envPasswordExists: !!envPassword,
        receivedCredentials: { username, passwordLength: password?.length }
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication failed',
      envPasswordExists: !!envPassword,
      receivedCredentials: { username, passwordLength: password?.length },
      debug: {
        usernameMatch: username === 'admin',
        passwordMatch: password === envPassword
      }
    }, { status: 401 })
    
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
