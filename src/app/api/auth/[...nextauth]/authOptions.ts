import { getUser } from '@/tools/mock/mockUser';
import { AuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

import mockUsersData from '~/mock-data/mock-users.json';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      authorize: async credentials => {
        try {
          const found = mockUsersData.users.find(
            u =>
              u.data.user.email === credentials?.identifier &&
              u.data.user.password === credentials?.password,
          );
          if (!found) return null;

          const cookieStore = cookies();
          const storedUser = cookieStore.get(`user_${found.data.user.id}`)?.value;

          const user = storedUser ? JSON.parse(storedUser) : found.data.user;
          const rememberMe = credentials?.rememberMe === 'true';
          const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
          const expires = new Date(Date.now() + maxAge * 1000);

          cookies().set('maxAge', `${expires}`, {
            httpOnly: true,
            path: '/',
            maxAge: maxAge,
            sameSite: 'strict',
            secure: true,
            expires: expires,
          });

          return {
            id: String(user.id),
            username: user.username,
            email: user.email,
            accessToken: 'mock-token',
            avatar: user.avatar || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            phoneNumber: user.phoneNumber || undefined,
          } as unknown as User;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (account) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.username = user.username;
        token.firstName = user.firstName || '';
        token.lastName = user.lastName || '';
        token.avatar = user?.avatar || null;
        token.phoneNumber = user?.phoneNumber || null;
      }

      if (trigger === 'update') {
        token.firstName = session.user.firstName || '';
        token.lastName = session.user.lastName || '';
        token.avatar = session.user?.avatar || null;
        token.phoneNumber = session.user?.phoneNumber || null;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.accessToken = token.accessToken;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.phoneNumber = token?.phoneNumber || null;
      session.user.avatar = token?.avatar || null;

      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    newUser: '/auth/sign-up',
  },
};
