import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export function ResourcesGuidesPage() {
  return (
    <div className="container py-12">
      <Seo
        title="Guides | VisionLink AI"
        description="Long-form guides for RPA automation, web scraping, and remote orchestration."
        pathname="/resources/guides"
        imagePath={DEFAULT_OG_IMAGE_PATH}
      />
      <SectionHeading
        title="Guides"
        description="Practical, engineering-first resources (content pipeline is implemented next)."
      />
    </div>
  );
}
