import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export function ResourcesApiReferencePage() {
  return (
    <div className="container py-12">
      <Seo
        title="API reference | VisionLink AI"
        description="REST and WebSocket reference for sessions, devices, and AI runs."
        pathname="/resources/api-reference"
        imagePath={DEFAULT_OG_IMAGE_PATH}
      />
      <SectionHeading
        title="API reference"
        description="A browsable API reference UI (OpenAPI + WS protocol) is implemented next."
      />
    </div>
  );
}
