import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UseCaseDataCollectionPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Data Collection at Scale with VisionLink AI",
      description:
        "Collect data from complex portals using browser automation, human approvals, and structured extraction workflows.",
      author: {
        "@type": "Organization",
        name: "VisionLink AI",
      },
      publisher: {
        "@type": "Organization",
        name: "VisionLink AI",
        logo: {
          "@type": "ImageObject",
          url: "https://visionlink.ai/logo.png",
        },
      },
      datePublished: "2026-02-03",
      dateModified: "2026-02-03",
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
          name: "Use Cases",
          item: "https://visionlink.ai/use-cases",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Data Collection",
          item: "https://visionlink.ai/use-cases/data-collection",
        },
      ],
    },
  ];

  return (
    <div className="container py-12">
      <Seo
        title="Automated Data Collection & Web Scraping at Scale | VisionLink AI"
        description="Collect data from complex portals using browser automation, human approvals, and structured extraction workflows. Extract data from any website."
        keywords="automated data extraction, market research data collection, web scraping at scale, data collection tools"
        pathname="/use-cases/data-collection"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="article"
        jsonLd={jsonLd}
      />
      <SectionHeading
        title="Data collection"
        description="Extract data from portals and GUIs that resist headless automation."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Portal scraping",
            body: "Use real browser sessions when APIs are unavailable or incomplete.",
          },
          {
            title: "Human approval",
            body: "Keep high-risk actions gated with explicit approve steps.",
          },
          {
            title: "Artifacts",
            body: "Attach screenshots and logs to runs for traceability (roadmap).",
          },
        ].map((x) => (
          <Card key={x.title} className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{x.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {x.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
