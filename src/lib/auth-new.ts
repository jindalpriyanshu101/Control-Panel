import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
  interface User {
    role: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('=== NEXTAUTH AUTHORIZE ===')
        
        if (!credentials?.username || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        console.log('Received:', {
          username: credentials.username,
          passwordLength: credentials.password.length
        })
        
        // Hardcode the expected values to eliminate any environment variable issues
        const ADMIN_USERNAME = 'admin'
        const ADMIN_PASSWORD = '1uG9ewM4fAxl7ChQ'
        
        console.log('Expected:', {
          username: ADMIN_USERNAME,
          passwordLength: ADMIN_PASSWORD.length
        })
        
        const isValidAdmin = credentials.username === ADMIN_USERNAME && 
                           credentials.password === ADMIN_PASSWORD
        
        console.log('Validation:', {
          usernameMatch: credentials.username === ADMIN_USERNAME,
          passwordMatch: credentials.password === ADMIN_PASSWORD,
          isValidAdmin
        })

        if (isValidAdmin) {
          console.log('✅ Admin authentication successful')
          return {
            id: 'admin',
            email: 'admin@cyberpanel.local',
            name: 'Administrator',
            role: 'admin'
          }
        }

        console.log('❌ Authentication failed')
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  debug: true // Enable debug mode to see more logs
}
