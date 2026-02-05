import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = { feature: string; visionlink: string; competitor: string };

export function CompareTemplate(props: {
  pathname: string;
  competitorName: string;
  title: string;
  description: string;
  rows: Row[];
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: props.title,
      description: props.description,
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
          name: "Compare",
          item: "https://visionlink.ai/compare",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${props.competitorName} Alternative`,
          item: `https://visionlink.ai${props.pathname}`,
        },
      ],
    },
  ];

  return (
    <div className="container py-12">
      <Seo
        title={props.title}
        description={props.description}
        keywords={`${props.competitorName} alternative, remote desktop comparison, RPA automation comparison, ${props.competitorName} vs VisionLink AI`}
        pathname={props.pathname}
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="article"
        jsonLd={jsonLd}
      />
      <h1 className="text-3xl font-semibold tracking-tight">
        {props.competitorName} alternative
      </h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        {props.description}
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-3 pr-4 font-semibold">Feature</th>
              <th className="py-3 pr-4 font-semibold">VisionLink AI</th>
              <th className="py-3 pr-4 font-semibold">
                {props.competitorName}
              </th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((r) => (
              <tr key={r.feature} className="border-b border-border/60">
                <td className="py-3 pr-4 align-top font-medium">{r.feature}</td>
                <td className="py-3 pr-4 align-top text-muted-foreground">
                  {r.visionlink}
                </td>
                <td className="py-3 pr-4 align-top text-muted-foreground">
                  {r.competitor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">
              When to choose VisionLink AI
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Choose VisionLink AI when you need automation-friendly remote
            sessions, a control plane API, and explicit approval-based AI
            workflows.
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Next step</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/trial">Start free trial</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">Compare plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
