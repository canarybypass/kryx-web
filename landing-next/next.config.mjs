/** @type {import('next').NextConfig} */

// basePath нужен для GitHub Pages в подкаталоге (xxxoff.github.io/kryx-landing).
// Локально (npm run dev) переменная не задана → basePath пустой, всё как обычно.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
