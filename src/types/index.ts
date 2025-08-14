export interface User {
  id: string
  email: string
  name?: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Website {
  id: string
  domain: string
  userId: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  package: string
  sslEnabled: boolean
  cyberpanelId?: string | null
  ipAddress?: string | null
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Activity {
  id: string
  userId: string
  action: string
  description: string
  metadata?: any
  type: 'USER_ACTION' | 'SYSTEM_ACTION' | 'WEBSITE_ACTION' | 'ADMIN_ACTION'
  createdAt: Date
  user?: User
}

export interface CreateUserRequest {
  email: string
  name?: string
  password: string
  role?: 'USER' | 'ADMIN'
}

export interface CreateWebsiteRequest {
  domain: string
  userId: string
  package?: string
}

export interface DashboardStats {
  totalUsers: number
  totalWebsites: number
  activeWebsites: number
  pendingWebsites: number
  recentActivities: Activity[]
}

export interface UserDashboardStats {
  totalWebsites: number
  activeWebsites: number
  bandwidthUsed: number
  storageUsed: number
  recentActivities: Activity[]
}
