import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/fitness",
        destination: "/fit",
        permanent: true,
      },
      {
        source: "/routines",
        destination: "/habits",
        permanent: true,
      },
      {
        source: "/nutrition",
        destination: "/fuel",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
