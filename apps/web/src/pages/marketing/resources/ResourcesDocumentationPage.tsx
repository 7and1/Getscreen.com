import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export function ResourcesDocumentationPage() {
  return (
    <div className="container py-12">
      <Seo
        title="Documentation | VisionLink AI"
        description="Product documentation for devices, sessions, WebSocket signaling, and AI workflows."
        pathname="/resources/documentation"
        imagePath={DEFAULT_OG_IMAGE_PATH}
      />
      <SectionHeading
        title="Documentation"
        description="Docs site scaffolding (API reference + message protocol) is implemented next."
      />
    </div>
  );
}
