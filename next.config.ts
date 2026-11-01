import type { NextConfig } from "next";

// Static export for GitHub Pages. When deploying under a project page
// (https://<user>.github.io/<repo>/) set BASE_PATH=/<repo> at build time.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // three.js and its R3F wrappers ship ESM that benefits from transpilation
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
