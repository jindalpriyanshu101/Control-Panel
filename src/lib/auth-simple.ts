import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth Authorize called')
        console.log('📝 Credentials received:', {
          username: credentials?.username,
          passwordLength: credentials?.password?.length
        })
        
        // Hardcoded credentials - no environment variable confusion
        if (credentials?.username === 'admin' && credentials?.password === '1uG9ewM4fAxl7ChQ') {
          console.log('✅ Authentication successful!')
          return {
            id: 'admin',
            email: 'admin@cyberpanel.local',
            name: 'Administrator'
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
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  debug: true
}
