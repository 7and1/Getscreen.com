import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export function ResourcesVideoTutorialsPage() {
  return (
    <div className="container py-12">
      <Seo
        title="Video tutorials | VisionLink AI"
        description="Short videos showing how to connect devices, start sessions, and use AI-assisted workflows."
        pathname="/resources/video-tutorials"
        imagePath={DEFAULT_OG_IMAGE_PATH}
      />
      <SectionHeading
        title="Video tutorials"
        description="Video library scaffolding is implemented next."
      />
    </div>
  );
}
