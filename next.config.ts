import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.REPO_NAME || "card-benefits-tracker";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
