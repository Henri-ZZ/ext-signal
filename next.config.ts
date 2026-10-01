import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Chrome Web Store 图标托管在 lh3。图标本身走 unoptimized，
    // 这里声明来源是为了让 next/image 的校验通过并显式限定允许的域名。
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
}

export default nextConfig
