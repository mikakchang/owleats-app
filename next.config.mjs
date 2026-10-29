/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages only serves static files, so that build is exported as plain HTML.
  // The page falls back to the demo menu when /api/menu isn't available.
  ...(isGitHubPages && {
    output: "export",
    basePath: "/owleats-app",
    images: { unoptimized: true }
  })
};

export default nextConfig;
