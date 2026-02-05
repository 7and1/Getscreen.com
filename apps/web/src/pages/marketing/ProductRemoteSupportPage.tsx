import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { ProductHeroSection } from "@/pages/marketing/product/ProductHeroSection";
import { FeatureDetailSection } from "@/pages/marketing/product/FeatureDetailSection";
import { ProductCtaSection } from "@/pages/marketing/product/ProductCtaSection";

export function ProductRemoteSupportPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "VisionLink AI Remote Support",
      description:
        "Secure remote desktop sessions for IT and support teams, with role-based access and an automation-ready control plane.",
      brand: {
        "@type": "Brand",
        name: "VisionLink AI",
      },
      offers: {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://visionlink.ai/product/remote-support",
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
          name: "Remote Support",
          item: "https://visionlink.ai/product/remote-support",
        },
      ],
    },
  ];

  return (
    <div>
      <Seo
        title="Remote Support Software - Secure Remote Desktop for IT Teams | VisionLink AI"
        description="Secure remote desktop sessions for IT and support teams, with role-based access, audit trails, and automation-ready control plane. TeamViewer alternative for IT."
        keywords="remote desktop for business, secure remote access for IT teams, IT support automation, remote desktop session recording"
        pathname="/product/remote-support"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="product"
        jsonLd={jsonLd}
      />

      <ProductHeroSection
        eyebrow="Product"
        title="Remote support, built for reliability"
        subtitle="Join sessions quickly, grant or revoke control, and keep a clean audit trail—without bolting automation onto legacy remote desktop tools."
        ctaLabel="Start Free Trial"
        ctaTo="/trial"
        imageAlt="Remote support session preview"
      />

      <FeatureDetailSection
        title="Support workflows"
        features={[
          {
            title: "Role-based sessions",
            body: "Support sessions should be permissioned and time-bounded.",
            bullets: [
              "Short-lived join tokens",
              "Controller vs observer roles",
              "Explicit session end",
              "Audit-ready events",
            ],
          },
          {
            title: "Operational visibility",
            body: "Know what’s connected and what’s failing before tickets pile up.",
            bullets: [
              "Device status and tags",
              "Session state transitions",
              "Usage meters",
              "Rate limiting controls",
            ],
          },
          {
            title: "Automation-ready",
            body: "When support workflows become repetitive, AI-assisted steps can help—with approvals by default.",
            bullets: [
              "Propose → approve loop",
              "Structured action messages",
              "Artifact hooks (roadmap)",
              "Policy guardrails",
            ],
          },
        ]}
      />

      <ProductCtaSection
        title="Support faster with fewer surprises"
        subtitle="Try the platform with a free trial and connect your first device."
      />
    </div>
  );
}
