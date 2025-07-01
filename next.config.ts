import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment variables");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      // {
      //   source: "/(.*)", // applies to all routes
      //   headers: [
      //     {
      //       key: "Content-Security-Policy",
      //       value: `default-src 'self'; connect-src 'self' ${SUPABASE_URL} https://uploadthing.com https://*.uploadthing.com;`
      //     }
      //   ]
      // },
    ];
  },
};

export default nextConfig;
