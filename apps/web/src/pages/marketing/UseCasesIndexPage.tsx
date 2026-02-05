import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    title: "Amazon sellers",
    description:
      "Listing, inventory checks, and price monitoring via browser-first automation.",
    to: "/use-cases/amazon-sellers",
  },
  {
    title: "Data collection",
    description:
      "Portal scraping and extraction workflows that don’t fit typical APIs.",
    to: "/use-cases/data-collection",
  },
  {
    title: "Enterprise IT",
    description:
      "Secure remote support sessions with clear roles and auditability.",
    to: "/use-cases/enterprise-it",
  },
];

export function UseCasesIndexPage() {
  const jsonLd = {
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
    ],
  };

  return (
    <div className="container py-12">
      <Seo
        title="Use Cases - RPA Automation, Web Scraping & IT Support | VisionLink AI"
        description="Explore VisionLink AI use cases for RPA automation, web scraping, e-commerce operations, and enterprise IT support. Real-world automation workflows."
        keywords="RPA use cases, web scraping use cases, automation workflows, remote desktop use cases"
        pathname="/use-cases"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        jsonLd={jsonLd}
      />
      <SectionHeading
        title="Use cases"
        description="Explore common workflows teams run with VisionLink AI."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {useCases.map((u) => (
          <Card key={u.to} className="border-border/60">
            <CardHeader>
              <CardTitle className="capitalize">{u.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{u.description}</p>
              <Button asChild variant="outline">
                <Link to={u.to}>Read more</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
