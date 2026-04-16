import fs from "fs";
import path from "path";
import { normalizeSiteConfig, type SiteConfig } from "./siteConfig";

/**
 * Reads public/site-config.json at build time and returns a normalized SiteConfig.
 * Falls back to defaultConfig if the file is missing or unparseable.
 * Only call this from Server Components or generateStaticParams — never from client code.
 */
export function getStaticConfig(): SiteConfig {
  const filePath = path.join(process.cwd(), "public", "site-config.json");
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return normalizeSiteConfig(JSON.parse(raw));
  } catch {
    return normalizeSiteConfig(null);
  }
}
