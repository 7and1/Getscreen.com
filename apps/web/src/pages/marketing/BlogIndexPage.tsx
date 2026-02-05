import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BlogIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "VisionLink AI Blog",
    description:
      "Technical guides and best practices for RPA automation, web scraping, and remote orchestration.",
    url: "https://visionlink.ai/blog",
    publisher: {
      "@type": "Organization",
      name: "VisionLink AI",
      logo: {
        "@type": "ImageObject",
        url: "https://visionlink.ai/logo.png",
      },
    },
  };

  return (
    <div className="container py-12">
      <Seo
        title="Blog - RPA Automation & Web Scraping Guides | VisionLink AI"
        description="Technical guides and best practices for RPA automation, web scraping, and remote orchestration. Learn how to scale automation workflows."
        keywords="RPA automation guides, web scraping tutorials, automation best practices, remote desktop tutorials"
        pathname="/blog"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        jsonLd={jsonLd}
      />
      <SectionHeading
        title="Blog"
        description="Guides, comparisons, and tutorials (content pipeline is implemented next)."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Browse categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/blog/category/rpa-automation">RPA automation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/blog/category/web-scraping">Web scraping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/blog/category/tutorials">Tutorials</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/blog/category/case-studies">Case studies</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Recommended reading</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Want to get started today? Visit the{" "}
            <Link
              className="text-foreground underline underline-offset-4"
              to="/resources/api-reference"
            >
              API reference
            </Link>{" "}
            and open the{" "}
            <Link
              className="text-foreground underline underline-offset-4"
              to="/app"
            >
              app
            </Link>{" "}
            to connect a device and create a session.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
