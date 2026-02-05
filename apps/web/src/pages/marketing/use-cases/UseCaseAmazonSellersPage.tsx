import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UseCaseAmazonSellersPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Amazon Seller Automation with VisionLink AI",
      description:
        "Automate listing workflows, monitor prices, and coordinate browser sessions across a fleet of devices for Amazon sellers.",
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
          name: "Amazon Sellers",
          item: "https://visionlink.ai/use-cases/amazon-sellers",
        },
      ],
    },
  ];

  return (
    <div className="container py-12">
      <Seo
        title="Amazon Seller Automation Tools - Automated Listing & Price Monitoring | VisionLink AI"
        description="Automate Amazon seller workflows with browser-first automation. Bulk listing updates, price monitoring, and inventory management at scale."
        keywords="Amazon seller automation tools, Amazon listing automation, Amazon price monitoring, eBay dropshipping automation"
        pathname="/use-cases/amazon-sellers"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="article"
        jsonLd={jsonLd}
      />
      <SectionHeading
        title="Amazon seller automation"
        description="Browser-first automation for workflows that APIs don’t cover."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Listing updates",
            body: "Bulk edit titles, attributes, and availability via controlled sessions.",
          },
          {
            title: "Price monitoring",
            body: "Collect competitor pricing signals with clear rate-limit guardrails.",
          },
          {
            title: "Inventory checks",
            body: "Run scheduled checks and surface exceptions for manual review.",
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
