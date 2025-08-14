import NextAuth from 'next-auth'

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
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    websites?: string[]
  }
}
