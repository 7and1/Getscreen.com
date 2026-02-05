import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { ProductHeroSection } from "@/pages/marketing/product/ProductHeroSection";
import { ProblemSolutionSection } from "@/pages/marketing/product/ProblemSolutionSection";
import { FeatureDetailSection } from "@/pages/marketing/product/FeatureDetailSection";
import { ProductCtaSection } from "@/pages/marketing/product/ProductCtaSection";

export function ProductRpaPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "VisionLink AI RPA Automation Platform",
      description:
        "Scale your RPA operations with AI-powered remote desktop automation. Compatible with UiPath, Automation Anywhere, and Blue Prism workflows.",
      brand: {
        "@type": "Brand",
        name: "VisionLink AI",
      },
      offers: {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://visionlink.ai/product/rpa-automation",
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
          name: "RPA Automation",
          item: "https://visionlink.ai/product/rpa-automation",
        },
      ],
    },
  ];

  return (
    <div>
      <Seo
        title="RPA Automation Software - AI Remote Desktop for UiPath & Automation Anywhere"
        description="Scale your RPA operations with AI-powered remote desktop automation. Compatible with UiPath, Automation Anywhere, Blue Prism. 99.9% uptime SLA."
        keywords="RPA automation tools, UiPath alternative, Automation Anywhere, Blue Prism, unattended automation, RPA software"
        pathname="/product/rpa-automation"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        ogType="product"
        jsonLd={jsonLd}
      />

      <ProductHeroSection
        eyebrow="Product"
        title="RPA Automation Platform"
        subtitle="Scale from 10 to 10,000 bots with reliable session orchestration, approvals, and auditable automation steps."
        ctaLabel="Start Free Trial"
        ctaTo="/trial"
        imageAlt="RPA dashboard preview"
      />

      <ProblemSolutionSection
        title="The RPA scaling challenge"
        problems={[
          {
            title: "❌ Connection failures",
            body: "Traditional tools can fail under load or network churn, forcing manual interventions and breaking unattended runs.",
          },
          {
            title: "❌ Costs at scale",
            body: "Per-seat remote desktop pricing can become prohibitive when you run dozens or hundreds of bots.",
          },
          {
            title: "❌ Limited visibility",
            body: "Without clear telemetry, audit logs, and controls, teams struggle to keep fleets healthy and compliant.",
          },
        ]}
        solutionsTitle="The VisionLink AI approach"
        solutions={[
          {
            title: "✓ Edge-first orchestration",
            body: "Durable Objects coordinate session state and roles with strong consistency for reliable signaling.",
          },
          {
            title: "✓ Human-in-the-loop safety",
            body: "AI suggests actions; operators approve. High-risk steps can require confirmation by policy.",
          },
          {
            title: "✓ Fleet operations foundation",
            body: "Devices, sessions, usage meters, and audit indices in D1; artifacts can be stored in R2.",
          },
        ]}
      />

      <FeatureDetailSection
        title="Enterprise RPA features"
        features={[
          {
            title: "Unattended automation",
            body: "Run bots with fewer manual interventions and a clear audit trail.",
            bullets: [
              "Scheduled execution (roadmap)",
              "Queue-based processing (roadmap)",
              "Automatic retry patterns",
              "Session lifecycle tracking",
            ],
          },
          {
            title: "Platform integration",
            body: "Integrate with existing RPA stacks using an API-first control plane.",
            bullets: [
              "UiPath Orchestrator (roadmap)",
              "Automation Anywhere CR (roadmap)",
              "Custom API integration",
              "Webhooks (roadmap)",
            ],
          },
          {
            title: "Real-time monitoring",
            body: "Monitor session status and device health across environments.",
            bullets: [
              "Online/offline presence",
              "Session state changes",
              "Usage meters",
              "Audit-ready events",
            ],
          },
        ]}
      />

      <ProductCtaSection
        title="Ready to scale RPA safely?"
        subtitle="Start a free trial, connect a device, and create your first session."
      />
    </div>
  );
}
