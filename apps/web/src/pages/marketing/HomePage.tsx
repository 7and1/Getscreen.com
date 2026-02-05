import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME } from "@/lib/site";
import { HeroSection } from "@/pages/marketing/home/HeroSection";
import { FeatureGridSection } from "@/pages/marketing/home/FeatureGridSection";
import { UseCasesSection } from "@/pages/marketing/home/UseCasesSection";
import { TestimonialsSection } from "@/pages/marketing/home/TestimonialsSection";
import { PricingPreviewSection } from "@/pages/marketing/home/PricingPreviewSection";
import { FinalCtaSection } from "@/pages/marketing/home/FinalCtaSection";

export function HomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows, macOS, Linux",
      description:
        "Enterprise remote desktop software with AI-powered automation for RPA, web scraping, and IT support. 10x faster than TeamViewer.",
      url: "https://visionlink.ai",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "127",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "AI-powered browser automation",
        "RPA automation platform",
        "Web scraping at scale",
        "Remote desktop for IT support",
        "Unattended automation",
        "API-first orchestration",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: "https://visionlink.ai",
      logo: "https://visionlink.ai/logo.png",
      description:
        "AI-native remote desktop platform for RPA automation, web scraping, and enterprise IT support.",
      sameAs: [
        "https://twitter.com/visionlinkai",
        "https://linkedin.com/company/visionlinkai",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@visionlink.ai",
        availableLanguage: ["English"],
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
      ],
    },
  ];

  return (
    <div>
      <Seo
        title="VisionLink AI - AI-Powered Remote Desktop & Browser Automation Platform"
        description="Enterprise remote desktop software with AI-powered automation for RPA, web scraping, and IT support. 10x faster than TeamViewer. Get started free."
        keywords="remote desktop software, RPA automation tools, web scraping software, browser automation tool, TeamViewer alternative"
        pathname="/"
        imagePath={DEFAULT_OG_IMAGE_PATH}
        jsonLd={jsonLd}
      />

      <HeroSection />
      <FeatureGridSection />
      <UseCasesSection />
      <TestimonialsSection />
      <PricingPreviewSection />
      <FinalCtaSection />
    </div>
  );
}

export default HomePage;
