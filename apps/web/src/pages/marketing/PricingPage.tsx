import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "VisionLink AI",
      description:
        "VisionLink AI is currently free to use. Create a workspace and API key to get started.",
      brand: {
        "@type": "Brand",
        name: "VisionLink AI",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://visionlink.ai/pricing",
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
          name: "Pricing",
          item: "https://visionlink.ai/pricing",
        },
      ],
    },
  ];

  return (
    <div className="container py-12">
      <Seo
        title="VisionLink AI is free"
        description="VisionLink AI is currently free to use. Create a workspace and API key to get started."
        keywords="free remote desktop, RPA automation, web scraping, browser automation tool"
        pathname="/pricing"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        jsonLd={jsonLd}
      />

      <h1 className="text-3xl font-semibold tracking-tight">
        Free, no billing
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        No plans, no credit card, no checkout. Create a free API key and start
        building.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">What you get</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>Free workspace + API key</li>
              <li>Devices + sessions</li>
              <li>WebSocket signaling + WebRTC session flows</li>
              <li>Usage insights endpoints (for ops)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Get started</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/get-started">Create free API key</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app">Open app</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PricingPage;
