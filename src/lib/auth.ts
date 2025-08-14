import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateCyberPanelLogin, getCyberPanelUser } from './userService'

// Extend NextAuth types to include our custom user properties
declare module 'next-auth' {
  interface User {
    role?: string
    websites?: string[]
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
      websites?: string[]
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    websites?: string[]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'cyberpanel',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth CyberPanel Authorize called')
        console.log('📝 Credentials received:', {
          username: credentials?.username,
          passwordLength: credentials?.password?.length
        })
        
        if (!credentials?.username || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          console.log(`🔐 Attempting to authenticate user: ${credentials.username}`)
          
          // Validate credentials against CyberPanel
          const isValidLogin = await validateCyberPanelLogin(
            credentials.username, 
            credentials.password
          )

          if (!isValidLogin) {
            console.log(`❌ Invalid credentials for user: ${credentials.username}`)
            return null
          }

          // Get user data from CyberPanel
          const user = await getCyberPanelUser(credentials.username)
          
          if (!user) {
            console.log(`❌ User not found in CyberPanel: ${credentials.username}`)
            return null
          }

          console.log(`✅ Authentication successful for user: ${credentials.username}`)
          
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,
            websites: user.websites,
          }
        } catch (error) {
          console.error('❌ Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  debug: true,
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT token
      if (user) {
        token.role = user.role
        token.websites = user.websites
      }
      return token
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.role = token.role
        session.user.websites = token.websites
      }
      return session
    }
  }
}
