import NextAuth, { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/app/db/db';
import { User } from '@/app/db/entities/User';
import * as bcrypt from 'bcrypt';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const repo = db.getRepository(User);

        const user = await repo.findOne({
          where: { email: credentials!.email },
        });

        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(credentials!.password, user.password);

        return ok ? { id: user.id, email: user.email } : null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const repo = db.getRepository(User);

      if (!user.email) return false;

      let dbUser = await repo.findOne({
        where: { email: user.email },
      });

      // REGISTER ON FIRST OAUTH LOGIN
      if (!dbUser) {
        dbUser = repo.create({
          email: user.email,
          login: user.email.split('@')[0],
        });

        await repo.save(dbUser);
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.getRepository(User).findOne({
          where: { email: user.email },
        });

        token.userId = dbUser?.id;
      }

      return token;
    },

    async session({ session, token }) {
      // ensure session.user exists before assigning id
      (session as any).user = { ...(session?.user ?? {}), userId: token.userId! };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
