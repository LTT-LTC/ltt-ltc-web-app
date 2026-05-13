import type { NextConfig } from "next";
const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    reactStrictMode: false,
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    outputFileTracingRoot: __dirname,
    outputFileTracingExcludes: {
        "**/*": [
            "**/.git/**/*",
            "**/node_modules/**/*",
            "**/.next/cache/**/*",
        ],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });
        return config;
    },
};

export default nextConfig;