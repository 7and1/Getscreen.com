import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { ProductHeroSection } from "@/pages/marketing/product/ProductHeroSection";
import { FeatureDetailSection } from "@/pages/marketing/product/FeatureDetailSection";
import { ProductCtaSection } from "@/pages/marketing/product/ProductCtaSection";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const scrapingUseCases = [
  {
    title: "Price monitoring",
    body: "Track competitor prices across e-commerce sites.",
  },
  {
    title: "Lead generation",
    body: "Extract contact info from directories with approvals.",
  },
  {
    title: "Market research",
    body: "Collect reviews and sentiment signals for analysis.",
  },
  {
    title: "Real estate data",
    body: "Scrape listings and market trends from portals.",
  },
  { title: "Job listings", body: "Aggregate postings from multiple sources." },
  {
    title: "Social media",
    body: "Extract public data with clear policy boundaries.",
  },
];

export function ProductWebScrapingPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "VisionLink AI Web Scraping Platform",
      description:
        "Enterprise web scraping platform with AI-powered anti-detection, IP rotation, and CAPTCHA solving. Extract data from any website at scale.",
      brand: {
        "@type": "Brand",
        name: "VisionLink AI",
      },
      offers: {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://visionlink.ai/product/web-scraping",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "127",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://visionlink.ai/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Web Scraping",
          item: "https://visionlink.ai/product/web-scraping",
        },
      ],
    },
  ];

  return (
    <div>
      <Seo
        title="Web Scraping Software - Headless Browser Automation with AI Anti-Detection"
        description="Enterprise web scraping platform with AI-powered anti-detection, IP rotation, and CAPTCHA solving. Extract data from any website at scale."
        keywords="web scraping software, headless browser automation, data extraction, web scraping API, browser automation framework"
        pathname="/product/web-scraping"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="product"
        jsonLd={jsonLd}
      />

      <ProductHeroSection
        eyebrow="Product"
        title="Web scraping at scale"
        subtitle="Use browser-first extraction for the sites APIs can’t reach. Coordinate sessions across fleets with safe, human-approved AI actions."
        ctaLabel="Start Free Trial"
        ctaTo="/trial"
        imageAlt="Web scraping dashboard preview"
      />

      <FeatureDetailSection
        title="Built for real-world portals"
        features={[
          {
            title: "Browser automation",
            body: "Drive real pages with WebRTC sessions and a structured action protocol.",
            bullets: [
              "Screenshots and artifacts",
              "Replayable action steps (roadmap)",
              "Human approvals",
              "Auditable outcomes",
            ],
          },
          {
            title: "Anti-detection strategy",
            body: "Operate across distributed devices rather than a single IP or headless fingerprint.",
            bullets: [
              "Device fleet model",
              "Session-based orchestration",
              "Policy guardrails",
              "Rate limiting controls",
            ],
          },
          {
            title: "Extraction workflows",
            body: "Prefer structured extraction when possible; fall back to visual methods when needed.",
            bullets: [
              "HTML parsing where possible",
              "Snapshot-based vision (roadmap)",
              "Artifact storage (roadmap)",
              "Webhook delivery (roadmap)",
            ],
          },
        ]}
      />

      <section className="container py-12">
        <SectionHeading
          title="Use cases"
          description="Common scraping workflows teams run on VisionLink-style browser automation fleets."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {scrapingUseCases.map((u) => (
            <Card key={u.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{u.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {u.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <ProductCtaSection
        title="Start scraping today"
        subtitle="Try the platform with a free trial—no credit card required."
      />
    </div>
  );
}
