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
      clientId: process.env.CLIENT_ID_GITHUB!,
      clientSecret: process.env.CLIENT_SECRET_GITHUB!,
    }),

    GoogleProvider({
      clientId: process.env.CLIENT_ID_GOOGLE!,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE!,
      httpOptions: {
        timeout: 10000,
      },
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        login: {},
        password: {},
      },
      async authorize(credentials) {
        const repo = db.getRepository(User);

        const user = await repo.findOne({
          where: { login: credentials!.login },
        });

        if (!user || !user.password) return null;

        const isOk = await bcrypt.compare(credentials!.password, user.password);

        return isOk
          ? { id: user.id, email: user.email, name: user.login }
          : null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account: _account }) {
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
      if (user) {
        const repo = db.getRepository(User);
        const dbUser = user.email
          ? await repo.findOne({ where: { email: user.email } })
          : await repo.findOne({ where: { id: user.id } });

        token.userId = dbUser?.id;
        token.role = dbUser?.role;
      }

      return token;
    },

    async session({ session, token }) {
      (session as { user: Record<string, unknown> }).user = {
        ...(session?.user ?? {}),
        userId: token.userId!,
        role: token.role,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
