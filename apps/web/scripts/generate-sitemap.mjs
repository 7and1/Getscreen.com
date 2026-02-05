import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webRoot = path.resolve(__dirname, "..");
const publicDir = path.join(webRoot, "public");

const SITE_URL = (process.env.SITE_URL || "https://visionlink.ai").replace(
  /\/+$/g,
  "",
);
const lastmod = new Date().toISOString().slice(0, 10);

function xmlEscape(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlset(paths) {
  const items = paths
    .map((p) => {
      const loc = `${SITE_URL}${p}`;
      // Set priority and changefreq based on page type
      let priority = "0.5";
      let changefreq = "monthly";

      if (p === "/") {
        priority = "1.0";
        changefreq = "weekly";
      } else if (p.startsWith("/product/") || p.startsWith("/pricing")) {
        priority = "0.9";
        changefreq = "weekly";
      } else if (p.startsWith("/compare/") || p.startsWith("/use-cases/")) {
        priority = "0.8";
        changefreq = "monthly";
      } else if (p.startsWith("/blog/")) {
        priority = "0.7";
        changefreq = "weekly";
      }

      return `<url><loc>${xmlEscape(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>\n`;
}

function sitemapIndex(entries) {
  const items = entries
    .map(
      (e) =>
        `<sitemap><loc>${xmlEscape(`${SITE_URL}${e.path}`)}</loc><lastmod>${lastmod}</lastmod></sitemap>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>\n`;
}

const productPages = [
  "/product/rpa-automation",
  "/product/web-scraping",
  "/product/remote-support",
];

const blogPages = [
  "/blog",
  "/blog/category/rpa-automation",
  "/blog/category/web-scraping",
  "/blog/category/tutorials",
  "/blog/category/case-studies",
];

const pages = [
  "/",
  "/pricing",
  "/trial",
  "/privacy",
  "/terms",
  "/use-cases",
  "/use-cases/amazon-sellers",
  "/use-cases/data-collection",
  "/use-cases/enterprise-it",
  "/compare/teamviewer-alternative",
  "/compare/anydesk-alternative",
  "/compare/chrome-remote-desktop-alternative",
  "/compare/parsehub-alternative",
  "/compare/octoparse-alternative",
  "/resources/guides",
  "/resources/documentation",
  "/resources/api-reference",
  "/resources/video-tutorials",
];

await fs.mkdir(publicDir, { recursive: true });

await fs.writeFile(
  path.join(publicDir, "sitemap-pages.xml"),
  urlset(pages),
  "utf8",
);
await fs.writeFile(
  path.join(publicDir, "sitemap-products.xml"),
  urlset(productPages),
  "utf8",
);
await fs.writeFile(
  path.join(publicDir, "sitemap-blog.xml"),
  urlset(blogPages),
  "utf8",
);

await fs.writeFile(
  path.join(publicDir, "sitemap.xml"),
  sitemapIndex([
    { path: "/sitemap-pages.xml" },
    { path: "/sitemap-blog.xml" },
    { path: "/sitemap-products.xml" },
  ]),
  "utf8",
);

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin/",
  "Disallow: /api/",
  "Disallow: /app/",
  "Disallow: /*.json$",
  "",
  "# Crawl-delay for polite crawlers",
  "User-agent: Googlebot",
  "Crawl-delay: 0",
  "",
  "User-agent: Bingbot",
  "Crawl-delay: 0",
  "",
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  "",
].join("\n");

await fs.writeFile(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log("Generated sitemaps and robots.txt", { SITE_URL, lastmod });
