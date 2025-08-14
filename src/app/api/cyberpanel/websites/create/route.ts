import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { createWebsiteCyberPanel, createDatabaseCyberPanel, createEmailCyberPanel } from '../../../../../lib/cyberpanel'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      domain, 
      ownerEmail, 
      packageName = 'Default', 
      phpVersion = '8.1',
      createDatabase = false,
      databaseName,
      databaseUser,
      databasePassword,
      createEmail = false,
      emailAddress,
      emailPassword
    } = body

    // Validate required fields
    if (!domain || !ownerEmail) {
      return NextResponse.json({ 
        error: 'Domain and owner email are required' 
      }, { status: 400 })
    }

    // Create website in CyberPanel
    const websiteResult = await createWebsiteCyberPanel(domain, ownerEmail, packageName)
    
    if (!websiteResult.status) {
      return NextResponse.json({ 
        error: 'Failed to create website in CyberPanel',
        details: websiteResult.error 
      }, { status: 400 })
    }

    const results = {
      website: websiteResult,
      database: null as any,
      email: null as any
    }

    // Create database if requested
    if (createDatabase && databaseName && databaseUser && databasePassword) {
      try {
        const dbResult = await createDatabaseCyberPanel(
          databaseName, 
          databaseUser, 
          databasePassword, 
          domain
        )
        results.database = dbResult
      } catch (error) {
        console.warn('Database creation failed:', error)
        results.database = { status: false, error: error.message }
      }
    }

    // Create email account if requested
    if (createEmail && emailAddress && emailPassword) {
      try {
        const emailResult = await createEmailCyberPanel(emailAddress, emailPassword)
        results.email = emailResult
      } catch (error) {
        console.warn('Email creation failed:', error)
        results.email = { status: false, error: error.message }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Website created successfully',
      data: results
    })

  } catch (error) {
    console.error('Error creating website:', error)
    return NextResponse.json({ 
      error: 'Failed to create website',
      details: error.message 
    }, { status: 500 })
  }
}
