import { useState } from "react";
import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import {
  PricingHeroSection,
  type BillingCadence,
} from "@/pages/marketing/pricing/PricingHeroSection";
import { PricingPlansSection } from "@/pages/marketing/pricing/PricingPlansSection";
import { PricingAddOnsSection } from "@/pages/marketing/pricing/PricingAddOnsSection";
import { PricingFaqSection } from "@/pages/marketing/pricing/PricingFaqSection";
import { PricingCtaSection } from "@/pages/marketing/pricing/PricingCtaSection";

export function PricingPage() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "VisionLink AI",
      description:
        "Flexible pricing for RPA automation and web scraping. Start free, scale as you grow. No hidden fees.",
      brand: {
        "@type": "Brand",
        name: "VisionLink AI",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Starter Plan",
          price: "29.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://visionlink.ai/pricing",
        },
        {
          "@type": "Offer",
          name: "Professional Plan",
          price: "99.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://visionlink.ai/pricing",
        },
        {
          "@type": "Offer",
          name: "Enterprise Plan",
          priceSpecification: {
            "@type": "PriceSpecification",
            price: "0",
            priceCurrency: "USD",
          },
          availability: "https://schema.org/InStock",
          url: "https://visionlink.ai/pricing",
        },
      ],
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
    <div>
      <Seo
        title="VisionLink AI Pricing - Simple, Transparent Plans Starting at $29/month"
        description="Flexible pricing for RPA automation and web scraping. Start free, scale as you grow. No hidden fees. 14-day free trial."
        keywords="remote desktop pricing, RPA automation pricing, web scraping pricing, TeamViewer alternative pricing"
        pathname="/pricing"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        jsonLd={jsonLd}
      />

      <PricingHeroSection cadence={cadence} onCadenceChange={setCadence} />
      <PricingPlansSection cadence={cadence} />
      <PricingAddOnsSection />
      <PricingFaqSection />
      <PricingCtaSection />
    </div>
  );
}
