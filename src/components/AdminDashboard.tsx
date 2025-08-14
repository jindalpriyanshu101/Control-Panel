'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { 
  Server, Users, Database, Globe, Plus, Settings, LogOut, BarChart3,
  Monitor, HardDrive, Activity, Mail, Lock, Trash2, Eye, Edit3,
  CheckCircle, AlertCircle, XCircle, Search, Filter, RefreshCw, X
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Website {
  id: string
  domain: string
  status: 'active' | 'inactive' | 'suspended'
  owner: string
  created: string
  plan: string
  diskUsed: number
  diskLimit: number
  bandwidthUsed: number
  bandwidthLimit: number
  phpVersion: string
  ssl: boolean
}

interface CyberPanelUser {
  id: string
  email: string
  name: string
  role: string
  websites: number
  created: string
}

interface SystemStats {
  totalUsers: number
  totalWebsites: number
  activeWebsites: number
  suspendedWebsites: number
  totalStorage: number
  totalBandwidth: number
  totalPackages: number
}

interface CreateWebsiteForm {
  domain: string
  ownerEmail: string
  packageName: string
  phpVersion: string
  createDatabase: boolean
  databaseName: string
  databaseUser: string
  databasePassword: string
  createEmail: boolean
  emailAddress: string
  emailPassword: string
}

export default function AdminDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [websites, setWebsites] = useState<Website[]>([])
  const [users, setUsers] = useState<CyberPanelUser[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalWebsites: 0,
    activeWebsites: 0,
    suspendedWebsites: 0,
    totalStorage: 0,
    totalBandwidth: 0,
    totalPackages: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<CreateWebsiteForm>({
    domain: '',
    ownerEmail: '',
    packageName: 'Default',
    phpVersion: '8.1',
    createDatabase: false,
    databaseName: '',
    databaseUser: '',
    databasePassword: '',
    createEmail: false,
    emailAddress: '',
    emailPassword: ''
  })

  const { success, error, warning, info } = useNotifications()

  useEffect(() => {
    loadCyberPanelData()
  }, [])

  const loadCyberPanelData = async () => {
    setIsLoading(true)
    info('Loading Data', 'Fetching latest data from CyberPanel...')
    
    try {
      const response = await fetch('/api/cyberpanel/data')
      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setWebsites(data.data.websites)
        setUsers(data.data.users)
        success('Data Loaded', `Successfully loaded ${data.data.websites.length} websites from CyberPanel`)
      } else {
        error('Load Failed', data.error || 'Failed to load CyberPanel data')
      }
    } catch (err) {
      error('Connection Error', 'Failed to connect to CyberPanel API')
      console.error('CyberPanel data fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWebsite = async () => {
    if (!createForm.domain || !createForm.ownerEmail) {
      warning('Missing Fields', 'Please fill in all required fields')
      return
    }

    setIsLoading(true)
    info('Creating Website', `Creating ${createForm.domain} in CyberPanel...`)

    try {
      const response = await fetch('/api/cyberpanel/websites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      const result = await response.json()

      if (result.success) {
        success('Website Created', `${createForm.domain} has been created successfully`)
        setShowCreateModal(false)
        setCreateForm({
          domain: '',
          ownerEmail: '',
          packageName: 'Default',
          phpVersion: '8.1',
          createDatabase: false,
          databaseName: '',
          databaseUser: '',
          databasePassword: '',
          createEmail: false,
          emailAddress: '',
          emailPassword: ''
        })
        loadCyberPanelData()
      } else {
        error('Creation Failed', result.error || 'Failed to create website')
      }
    } catch (err) {
      error('Creation Error', 'Failed to create website')
      console.error('Website creation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWebsite = async (domain: string) => {
    setIsLoading(true)
    info('Deleting Website', `Deleting ${domain} from CyberPanel...`)

    try {
      const response = await fetch(`/api/cyberpanel/websites/delete?domain=${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        success('Website Deleted', `${domain} has been deleted successfully`)
        setShowDeleteConfirm(null)
        loadCyberPanelData()
      } else {
        error('Deletion Failed', result.error || 'Failed to delete website')
      }
    } catch (err) {
      error('Deletion Error', 'Failed to delete website')
      console.error('Website deletion error:', err)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Server className="w-8 h-8 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">ElementiX Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadCyberPanelData}
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
              { id: 'users', label: 'Users', icon: Users },
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
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-purple-500' },
                { label: 'Total Websites', value: stats.totalWebsites, icon: Globe, color: 'from-green-500 to-blue-500' },
                { label: 'Active Websites', value: stats.activeWebsites, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
                { label: 'Storage Used', value: formatBytes(stats.totalStorage), icon: HardDrive, color: 'from-orange-500 to-red-500' }
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

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                System Status
              </h2>
              <div className="text-gray-300">
                <p>✅ CyberPanel API: Connected</p>
                <p>✅ Database: Online</p>
                <p>✅ Total Packages: {stats.totalPackages}</p>
                <p>📊 Bandwidth Used: {formatBytes(stats.totalBandwidth)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Websites Tab */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Website Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Website</span>
              </button>
            </div>

            {/* Websites Table */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Domain</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Owner</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Plan</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Storage</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No websites found</p>
                          <p className="text-sm mt-1">
                            {isLoading ? 'Loading...' : 'Click "Create Website" to add your first website'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      websites.map((website) => (
                        <tr key={website.id} className="border-t border-gray-700/50 hover:bg-black/20">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Globe className="w-4 h-4 text-cyan-400" />
                              <span className="text-white font-medium">{website.domain}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(website.status)}`}>
                              {getStatusIcon(website.status)}
                              <span className="capitalize">{website.status}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{website.owner}</td>
                          <td className="p-4 text-gray-300">{website.plan}</td>
                          <td className="p-4 text-gray-300">
                            {formatBytes(website.diskUsed)} / {formatBytes(website.diskLimit)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-cyan-400 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setShowDeleteConfirm(website.domain)}
                                disabled={isLoading}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Name</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Websites</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Created</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-gray-700/50 hover:bg-black/20">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Users className="w-4 h-4 text-cyan-400" />
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{user.websites}</td>
                        <td className="p-4 text-gray-300">{user.created}</td>
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">CyberPanel Configuration</h3>
              <div className="space-y-4 text-gray-300">
                <p>🔗 Server URL: Connected</p>
                <p>👤 Admin User: Connected</p>
                <p>🔄 API Status: Active</p>
                <button 
                  onClick={loadCyberPanelData}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Website Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Website</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Domain Name *</label>
                  <input
                    type="text"
                    value={createForm.domain}
                    onChange={(e) => setCreateForm({...createForm, domain: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Owner Email *</label>
                  <input
                    type="email"
                    value={createForm.ownerEmail}
                    onChange={(e) => setCreateForm({...createForm, ownerEmail: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Package</label>
                  <select
                    value={createForm.packageName}
                    onChange={(e) => setCreateForm({...createForm, packageName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="Default">Default</option>
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">PHP Version</label>
                  <select
                    value={createForm.phpVersion}
                    onChange={(e) => setCreateForm({...createForm, phpVersion: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="8.1">PHP 8.1</option>
                    <option value="8.0">PHP 8.0</option>
                    <option value="7.4">PHP 7.4</option>
                  </select>
                </div>
              </div>

              {/* Database Section */}
              <div className="border-t border-gray-600 pt-4">
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={createForm.createDatabase}
                    onChange={(e) => setCreateForm({...createForm, createDatabase: e.target.checked})}
                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">Create Database</span>
                </label>

                {createForm.createDatabase && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={createForm.databaseName}
                      onChange={(e) => setCreateForm({...createForm, databaseName: e.target.value})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Database Name"
                    />
                    <input
                      type="text"
                      value={createForm.databaseUser}
                      onChange={(e) => setCreateForm({...createForm, databaseUser: e.target.value})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="DB Username"
                    />
                    <input
                      type="password"
                      value={createForm.databasePassword}
                      onChange={(e) => setCreateForm({...createForm, databasePassword: e.target.value})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="DB Password"
                    />
                  </div>
                )}
              </div>

              {/* Email Section */}
              <div className="border-t border-gray-600 pt-4">
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={createForm.createEmail}
                    onChange={(e) => setCreateForm({...createForm, createEmail: e.target.checked})}
                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">Create Email Account</span>
                </label>

                {createForm.createEmail && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={createForm.emailAddress}
                      onChange={(e) => setCreateForm({...createForm, emailAddress: e.target.value})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="admin@domain.com"
                    />
                    <input
                      type="password"
                      value={createForm.emailPassword}
                      onChange={(e) => setCreateForm({...createForm, emailPassword: e.target.value})}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Email Password"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWebsite}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Website'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Confirm Deletion</h2>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{showDeleteConfirm}</strong>? This action cannot be undone and will remove all website data from CyberPanel.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWebsite(showDeleteConfirm)}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Website'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
