'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { 
  Server, Globe, Database, Mail, Lock, LogOut, BarChart3,
  Monitor, HardDrive, Activity, Plus, Settings, Eye, Edit3,
  CheckCircle, AlertCircle, XCircle, Zap, Shield, RefreshCw, X
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface UserWebsite {
  id: string
  domain: string
  status: 'active' | 'inactive' | 'suspended'
  plan: string
  diskUsed: number
  diskLimit: number
  bandwidthUsed: number
  bandwidthLimit: number
  visitorsCount: number
  created: string
  phpVersion: string
  ssl: boolean
}

interface UserDatabase {
  id: string
  name: string
  website: string
  size: number
  created: string
}

interface UserEmail {
  id: string
  email: string
  domain: string
  created: string
}

interface UserStats {
  totalWebsites: number
  activeWebsites: number
  totalStorage: number
  usedStorage: number
  totalBandwidth: number
  usedBandwidth: number
  thisMonthVisitors: number
  totalDatabases: number
  totalEmails: number
}

export default function UserDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [websites, setWebsites] = useState<UserWebsite[]>([])
  const [databases, setDatabases] = useState<UserDatabase[]>([])
  const [emails, setEmails] = useState<UserEmail[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalWebsites: 0,
    activeWebsites: 0,
    totalStorage: 0,
    usedStorage: 0,
    totalBandwidth: 0,
    usedBandwidth: 0,
    thisMonthVisitors: 0,
    totalDatabases: 0,
    totalEmails: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  const { success, error, warning, info } = useNotifications()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setIsLoading(true)
    info('Loading Data', 'Fetching your website data from CyberPanel...')
    
    try {
      const response = await fetch('/api/cyberpanel/data')
      const data = await response.json()

      if (data.success) {
        // Filter data for current user
        const userWebsites = data.data.websites.filter((w: any) => 
          w.owner === user.email || w.owner === user.name
        )
        
        const userDatabases = data.data.databases?.filter((d: any) => 
          userWebsites.some((w: any) => w.domain === d.website)
        ) || []
        
        const userEmails = data.data.emails?.filter((e: any) => 
          userWebsites.some((w: any) => e.domain.includes(w.domain))
        ) || []

        // Calculate user-specific stats
        const userStats = {
          totalWebsites: userWebsites.length,
          activeWebsites: userWebsites.filter((w: any) => w.status === 'active').length,
          totalStorage: userWebsites.reduce((sum: number, w: any) => sum + w.diskLimit, 0),
          usedStorage: userWebsites.reduce((sum: number, w: any) => sum + w.diskUsed, 0),
          totalBandwidth: userWebsites.reduce((sum: number, w: any) => sum + w.bandwidthLimit, 0),
          usedBandwidth: userWebsites.reduce((sum: number, w: any) => sum + w.bandwidthUsed, 0),
          thisMonthVisitors: userWebsites.reduce((sum: number, w: any) => sum + w.visitorsCount, 0),
          totalDatabases: userDatabases.length,
          totalEmails: userEmails.length
        }

        setWebsites(userWebsites)
        setDatabases(userDatabases)
        setEmails(userEmails)
        setStats(userStats)
        success('Data Loaded', 'Successfully fetched your website data')
      } else {
        error('Load Failed', data.error || 'Failed to load website data')
      }
    } catch (err) {
      error('Connection Error', 'Failed to connect to CyberPanel API')
      console.error('User data fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />
      case 'inactive':
        return <XCircle className="w-3 h-3" />
      case 'suspended':
        return <AlertCircle className="w-3 h-3" />
      default:
        return <XCircle className="w-3 h-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10'
      case 'inactive':
        return 'text-red-400 bg-red-400/10'
      case 'suspended':
        return 'text-yellow-400 bg-yellow-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const k = 1024
    const sizes = ['MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getUsagePercentage = (used: number, total: number) => {
    if (total === 0) return 0
    return Math.min((used / total) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Server className="w-8 h-8 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">My Hosting Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadUserData}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="text-gray-300">Welcome, {user.name || user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/10 backdrop-blur-lg border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'websites', label: 'Websites', icon: Globe },
              { id: 'databases', label: 'Databases', icon: Database },
              { id: 'emails', label: 'Email', icon: Mail },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Websites', value: stats.totalWebsites, icon: Globe, color: 'from-blue-500 to-purple-500' },
                { label: 'Active Sites', value: stats.activeWebsites, icon: CheckCircle, color: 'from-green-500 to-blue-500' },
                { label: 'Total Visitors', value: stats.thisMonthVisitors.toLocaleString(), icon: Eye, color: 'from-orange-500 to-red-500' },
                { label: 'Databases', value: stats.totalDatabases, icon: Database, color: 'from-purple-500 to-pink-500' }
              ].map((stat, index) => (
                <div key={index} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Usage Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Storage Usage */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <HardDrive className="w-5 h-5 mr-2 text-cyan-400" />
                  Storage Usage
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Used: {formatBytes(stats.usedStorage)}</span>
                    <span className="text-gray-300">Total: {formatBytes(stats.totalStorage)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getUsagePercentage(stats.usedStorage, stats.totalStorage)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {getUsagePercentage(stats.usedStorage, stats.totalStorage).toFixed(1)}% used
                  </p>
                </div>
              </div>

              {/* Bandwidth Usage */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  Bandwidth Usage
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Used: {formatBytes(stats.usedBandwidth)}</span>
                    <span className="text-gray-300">Total: {formatBytes(stats.totalBandwidth)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getUsagePercentage(stats.usedBandwidth, stats.totalBandwidth)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {getUsagePercentage(stats.usedBandwidth, stats.totalBandwidth).toFixed(1)}% used
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all">
                  <Plus className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Add Website</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all">
                  <Database className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Create Database</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                  <Mail className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Add Email</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Websites Tab */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Websites</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all">
                <Plus className="w-4 h-4" />
                <span>Add Website</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {websites.map((website) => (
                <div key={website.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">{website.domain}</h3>
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(website.status)}`}>
                      {getStatusIcon(website.status)}
                      <span className="capitalize">{website.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Storage</p>
                      <p className="text-white font-medium">{formatBytes(website.diskUsed)} / {formatBytes(website.diskLimit)}</p>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-cyan-500 h-1 rounded-full"
                          style={{ width: `${getUsagePercentage(website.diskUsed, website.diskLimit)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Bandwidth</p>
                      <p className="text-white font-medium">{formatBytes(website.bandwidthUsed)} / {formatBytes(website.bandwidthLimit)}</p>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full"
                          style={{ width: `${getUsagePercentage(website.bandwidthUsed, website.bandwidthLimit)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400">Visitors</p>
                      <p className="text-white">{website.visitorsCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">PHP Version</p>
                      <p className="text-white">{website.phpVersion}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Plan</p>
                      <p className="text-white">{website.plan}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">SSL</p>
                      <p className="text-white">{website.ssl ? '✅ Enabled' : '❌ Disabled'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      <Eye className="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      <Settings className="w-3 h-3" />
                      <span>Settings</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                      <Shield className="w-3 h-3" />
                      <span>SSL</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Databases Tab */}
        {activeTab === 'databases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Database Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
                <Plus className="w-4 h-4" />
                <span>Create Database</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Database Name</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Website</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Size</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Created</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {databases.map((database) => (
                      <tr key={database.id} className="border-t border-gray-700/50 hover:bg-black/20">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Database className="w-4 h-4 text-green-400" />
                            <span className="text-white font-medium">{database.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{database.website}</td>
                        <td className="p-4 text-gray-300">{formatBytes(database.size)}</td>
                        <td className="p-4 text-gray-300">{database.created}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-cyan-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Emails Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Email Accounts</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                <Plus className="w-4 h-4" />
                <span>Create Email</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Email Address</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Domain</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Created</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id} className="border-t border-gray-700/50 hover:bg-black/20">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-medium">{email.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{email.domain}</td>
                        <td className="p-4 text-gray-300">{email.created}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-cyan-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="space-y-4 text-gray-300">
                <p>📧 Email: {user.email}</p>
                <p>👤 Name: {user.name || 'Not set'}</p>
                <p>🔄 Account Status: Active</p>
                <button 
                  onClick={loadUserData}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
