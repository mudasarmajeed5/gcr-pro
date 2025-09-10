// next.config.ts
import type { NextConfig } from "next";
import createNextPWA from "next-pwa";

const withPWA = createNextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
},
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {}
};

export default withPWA(nextConfig as any); // Type assertion workaround