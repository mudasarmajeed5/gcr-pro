import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    id?: string
    // optional theme id saved in user settings
    user?: {
      id?: string;
      themeId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}
export default {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "profile",
            "email",
            "https://www.googleapis.com/auth/classroom.courses.readonly",
            "https://www.googleapis.com/auth/classroom.rosters.readonly",
            "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
            "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
            "https://www.googleapis.com/auth/classroom.announcements.readonly",
            "https://www.googleapis.com/auth/classroom.topics.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow sign-in from @students.au.edu.pk email addresses
      const email = user.email || profile?.email;
      if (!email || !email.endsWith('@students.au.edu.pk')) {
        return false; // Deny sign-in
      }
      return true; // Allow sign-in
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000 - 300000) {
        return token;
      }

      // Token refresh logic
      if (token.refreshToken) {
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.AUTH_GOOGLE_ID!,
              client_secret: process.env.AUTH_GOOGLE_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });

          const refreshedTokens = await response.json();

          if (!response.ok) {
            throw refreshedTokens;
          }

          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      // attach id and themeId from DB if available
      const userId = token.sub as string | undefined
      session.user = session.user || {}
      if (userId) {
        session.user.id = userId
        // NOTE: DB lookup removed here to avoid importing server-only modules in auth callback
        // Theme will be applied by the client ThemeProvider which can fetch settings server-side.
      }

      return session;
    },

  },
} satisfies NextAuthConfig;