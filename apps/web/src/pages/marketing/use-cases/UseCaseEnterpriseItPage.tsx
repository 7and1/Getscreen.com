import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UseCaseEnterpriseItPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Enterprise IT Remote Support with VisionLink AI",
      description:
        "Secure remote assistance for IT teams with role-based sessions, token expiry, and audit-ready events.",
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
          name: "Enterprise IT",
          item: "https://visionlink.ai/use-cases/enterprise-it",
        },
      ],
    },
  ];

  return (
    <div className="container py-12">
      <Seo
        title="Enterprise Remote Desktop Solution - Secure IT Support | VisionLink AI"
        description="Secure remote assistance for IT teams with role-based sessions, token expiry, and audit-ready events. Enterprise remote desktop for business."
        keywords="enterprise remote desktop solution, secure remote access for IT teams, remote desktop for business, IT support automation"
        pathname="/use-cases/enterprise-it"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="article"
        jsonLd={jsonLd}
      />
      <SectionHeading
        title="Enterprise IT"
        description="Remote support sessions with permissions, visibility, and a path to compliance."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Access controls",
            body: "Roles, short-lived tokens, and clear session boundaries.",
          },
          {
            title: "Auditability",
            body: "Index audit events in D1; store large payloads in artifacts (roadmap).",
          },
          {
            title: "Reliability",
            body: "Edge-first orchestration for predictable session setup and coordination.",
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
