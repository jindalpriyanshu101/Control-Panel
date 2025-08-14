import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  success: (title: string, message: string, duration?: number) => void
  error: (title: string, message: string, duration?: number) => void
  warning: (title: string, message: string, duration?: number) => void
  info: (title: string, message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto remove notification after duration
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 5000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const success = useCallback((title: string, message: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration })
  }, [addNotification])

  const error = useCallback((title: string, message: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration })
  }, [addNotification])

  const warning = useCallback((title: string, message: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration })
  }, [addNotification])

  const info = useCallback((title: string, message: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration })
  }, [addNotification])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

function NotificationCard({ notification, onRemove }: { 
  notification: Notification
  onRemove: () => void 
}) {
  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colorMap = {
    success: 'bg-green-500/10 border-green-500/20 text-green-300',
    error: 'bg-red-500/10 border-red-500/20 text-red-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-300'
  }

  const Icon = iconMap[notification.type]

  return (
    <div className={`max-w-sm w-full bg-gray-800 border ${colorMap[notification.type]} rounded-lg shadow-lg p-4 transition-all duration-300 animate-slide-in`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-white">{notification.title}</h4>
          <p className="text-sm mt-1 text-gray-300">{notification.message}</p>
        </div>
        <button
          onClick={onRemove}
          className="ml-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// CSS for animation (add to globals.css)
export const notificationStyles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`
