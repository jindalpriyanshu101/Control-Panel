/**
 * CyberPanel API utilities for authentication and API calls
 * Updated to use proper token-based authentication as per CyberPanel Cloud API
 */

interface CyberPanelResponse {
  status?: boolean
  error?: string
  data?: any
  message?: string
}

interface CyberPanelConfig {
  baseURL: string
  username: string
  token: string
}

/**
 * Make an authenticated request to CyberPanel API
 * Based on CyberPanel source code: cloudAPI/views.py and cloudManager.py
 */
export async function cyberPanelRequest(
  controller: string, 
  data: Record<string, any> = {}
): Promise<CyberPanelResponse> {
  const url = process.env.CYBERPANEL_URL
  const username = process.env.CYBERPANEL_USERNAME
  const token = process.env.CYBERPANEL_TOKEN
  const password = process.env.CYBERPANEL_PASSWORD

  if (!url || !username) {
    console.warn('CyberPanel credentials not configured. Required: CYBERPANEL_URL, CYBERPANEL_USERNAME')
    return { status: false, error: 'CyberPanel not configured' }
  }

  // Try token authentication first, then fallback to password
  const authMethods: Array<{
    name: string
    headers: Record<string, string>
    data: Record<string, any>
  }> = []
  
  if (token) {
    authMethods.push({
      name: 'Token',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      data: {
        controller,
        serverUserName: username,
        ...data
      }
    })
  }
  
  if (password) {
    authMethods.push({
      name: 'Password',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        controller,
        serverUserName: username,
        password,
        ...data
      }
    })
  }

  if (authMethods.length === 0) {
    return { status: false, error: 'No authentication method available (need token or password)' }
  }

  for (const method of authMethods) {
    try {
      console.log(`CyberPanel API Request (${method.name}):`, { 
        url: `${url}/cloudAPI/`, 
        controller, 
        serverUserName: username,
        additionalData: data 
      })

      const response = await fetch(`${url}/cloudAPI/`, {
        method: 'POST',
        headers: method.headers,
        body: JSON.stringify(method.data)
      })

      if (!response.ok) {
        console.error(`${method.name} HTTP Error:`, response.status, response.statusText)
        continue
      }

      const responseText = await response.text()
      console.log(`${method.name} Raw Response:`, responseText)
      
      // Try to parse as JSON
      try {
        const result = JSON.parse(responseText)
        console.log(`${method.name} Parsed Response:`, result)
        
        // Check if this looks like a valid CyberPanel response
        if (result.status !== undefined || result.error_message !== undefined) {
          // Check if the response indicates success
          if (result.status === 1 || result.status === true || result.status === 'success') {
            return { status: true, data: result.data || result, message: result.message }
          } else {
            const error = result.error_message || result.error || 'Unknown error'
            // Don't return error immediately, try next auth method
            console.log(`${method.name} authentication failed:`, error)
            if (error.includes('Invalid login') || error.includes('Unauthorized') || error.includes('API Access Disabled')) {
              continue
            }
            return { status: false, error }
          }
        }
        
        return { status: false, error: 'Invalid response format' }
      } catch (parseError) {
        console.error(`${method.name} JSON parse failed:`, parseError)
        continue
      }
    } catch (error) {
      console.error(`${method.name} request failed:`, error)
      continue
    }
  }

  return { status: false, error: 'All authentication methods failed' }
}

/**
 * Verify CyberPanel login credentials
 */
export async function verifyCyberPanelLogin() {
  return cyberPanelRequest('verifyLogin')
}

/**
 * Create a new website in CyberPanel
 */
export async function createWebsiteCyberPanel(domain: string, email: string, packageName: string = 'Default') {
  return cyberPanelRequest('submitWebsiteCreation', {
    domainName: domain,
    ownerEmail: email,
    packageName,
    websiteOwner: 'admin'
  })
}

/**
 * Delete a website from CyberPanel
 */
export async function deleteWebsiteCyberPanel(domain: string) {
  return cyberPanelRequest('submitWebsiteDeletion', {
    websiteName: domain
  })
}

/**
 * Fetch all websites from CyberPanel
 */
export async function fetchCyberPanelWebsites(page: number = 1, recordsToShow: number = 50) {
  return cyberPanelRequest('fetchWebsites', {
    page,
    recordsToShow
  })
}

/**
 * Fetch all packages from CyberPanel
 */
export async function fetchCyberPanelPackages() {
  return cyberPanelRequest('fetchPackages')
}

/**
 * Fetch all users from CyberPanel
 */
export async function fetchCyberPanelUsers() {
  return cyberPanelRequest('fetchUsers')
}

/**
 * Fetch child users from CyberPanel
 */
export async function fetchCyberPanelChildUsers() {
  return cyberPanelRequest('fetchChildUsers')
}

/**
 * Create a database in CyberPanel
 */
export async function createDatabaseCyberPanel(dbName: string, dbUsername: string, dbPassword: string, websiteName: string) {
  return cyberPanelRequest('submitDBCreation', {
    databaseWebsite: websiteName,
    dbName,
    dbUsername,
    dbPassword
  })
}

/**
 * Create an email account in CyberPanel
 */
export async function createEmailCyberPanel(email: string, password: string) {
  const [username, domain] = email.split('@')
  return cyberPanelRequest('submitEmailCreation', {
    domain,
    userName: username,
    password
  })
}

/**
 * Legacy CyberPanelAPI class for backward compatibility
 * Updated to use proper token authentication
 */
export class CyberPanelAPI {
  private config: CyberPanelConfig

  constructor(config: CyberPanelConfig) {
    this.config = config
  }

  async createWebsite(data: { domainName: string; ownerEmail: string; packageName?: string; websiteOwner?: string }) {
    const result = await createWebsiteCyberPanel(
      data.domainName, 
      data.ownerEmail, 
      data.packageName || 'Default'
    )
    return {
      status: result.status ? 'success' : 'error',
      message: result.error || 'Website creation completed',
      websiteId: data.domainName
    }
  }

  async deleteWebsite(domainName: string) {
    const result = await deleteWebsiteCyberPanel(domainName)
    return {
      status: result.status ? 'success' : 'error',
      message: result.error || 'Website deletion completed'
    }
  }

  async installSSL(data: { domainName: string; email: string }) {
    // SSL installation through CyberPanel API
    const result = await cyberPanelRequest('issueSSL', {
      domainName: data.domainName,
      email: data.email
    })
    return {
      status: result.status ? 'success' : 'error',
      message: result.error || 'SSL installation completed'
    }
  }

  async getWebsiteStatus(domainName: string) {
    const result = await cyberPanelRequest('getWebsiteDetails', {
      domainName
    })
    return {
      status: result.status ? 'success' : 'error',
      message: result.error || 'Website status retrieved',
      websiteData: result.data
    }
  }

  async createDatabase(websiteName: string, databaseName: string, username: string, password: string) {
    return createDatabaseCyberPanel(databaseName, username, password, websiteName)
  }

  async createEmailAccount(domainName: string, email: string, password: string) {
    return createEmailCyberPanel(email, password)
  }

  async createBackup(domainName: string) {
    const result = await cyberPanelRequest('submitBackupCreation', {
      websiteName: domainName
    })
    return {
      status: result.status ? 'success' : 'error',
      message: result.error || 'Backup creation completed'
    }
  }
}

// Singleton instance
let cyberPanelAPI: CyberPanelAPI | null = null

export function getCyberPanelAPI(): CyberPanelAPI {
  if (!cyberPanelAPI) {
    const config: CyberPanelConfig = {
      baseURL: process.env.CYBERPANEL_URL || 'https://localhost:8090',
      username: process.env.CYBERPANEL_USERNAME || 'admin',
      token: process.env.CYBERPANEL_TOKEN || ''
    }
    cyberPanelAPI = new CyberPanelAPI(config)
  }
  return cyberPanelAPI
}
