/**
 * NextAuth Configuration with Quantum-Safe Session Management
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { generateQuantumSafeToken } from '@/lib/quantum/crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo mode — in production, validate against DB with bcrypt
        if (!credentials?.email || !credentials?.password) return null;

        // For demo, accept any valid-looking credentials
        return {
          id: 'demo-user-' + generateQuantumSafeToken(8),
          name: credentials.email.split('@')[0],
          email: credentials.email,
          image: null,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = 'CREATOR';
        token.quantumToken = generateQuantumSafeToken();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/onboarding',
  },
};
