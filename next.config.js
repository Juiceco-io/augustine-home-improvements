const isCiBuild = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

if (isCiBuild && !process.env.NEXT_PUBLIC_CMS_CONFIG_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_CMS_CONFIG_URL for CI build. Refusing to ship a public bundle that silently falls back to defaultConfig.",
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
