import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import authConfig from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./lib/client";

const dbAdapterEnabled = process.env.AUTH_DISABLE_DB_ADAPTER !== "true";

const nextAuthConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  ...authConfig,
  ...(dbAdapterEnabled ? { adapter: MongoDBAdapter(client) } : {}),
};

export const { handlers, signIn, signOut, auth } = NextAuth(nextAuthConfig);
