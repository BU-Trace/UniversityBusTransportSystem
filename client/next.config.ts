import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
<<<<<<< HEAD
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
=======
        hostname: "th.bing.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
      },
    ],
  },
};

<<<<<<< HEAD
export default nextConfig;
=======
export default nextConfig;
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
