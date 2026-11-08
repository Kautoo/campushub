import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth/password";
import { users } from "@/lib/db/repo";
import { hasDatabaseEnv } from "@/lib/db";

/**
 * Auth.js v5 (credentials + JWT sessions) replacing Supabase Auth.
 * - Credentials provider checks email+password against public.users
 *   (scrypt hashes via lib/auth/password.ts).
 * - session.strategy "jwt": no DB session lookups per request; no adapter
 *   tables needed (users are created by the signUp action / repo).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!hasDatabaseEnv()) return null;
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        const user = await users.getByEmail(email);
        if (!user) return null;
        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    /** Keep the DB user id on the token/session (sub is set from user.id). */
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    /** Expose the DB user id to the session (default omits it). */
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
