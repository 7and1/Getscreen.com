import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

const categoryCopy: Record<string, { title: string; description: string }> = {
  "rpa-automation": {
    title: "RPA automation",
    description:
      "Guides and best practices for scaling RPA automation with reliable remote orchestration.",
  },
  "web-scraping": {
    title: "Web scraping",
    description:
      "Articles on portal scraping, browser automation, and safe extraction workflows.",
  },
  tutorials: {
    title: "Tutorials",
    description:
      "Step-by-step tutorials for integrating sessions, signaling, and automation flows.",
  },
  "case-studies": {
    title: "Case studies",
    description:
      "Stories and patterns from automation teams building reliable operations.",
  },
};

export function BlogCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const copy = useMemo(() => (slug ? categoryCopy[slug] : null), [slug]);

  if (!slug || !copy) {
    return (
      <div className="container py-12">
        <Seo title="Blog category | VisionLink AI" noindex />
        <h1 className="text-2xl font-semibold tracking-tight">
          Unknown category
        </h1>
        <p className="mt-2 text-muted-foreground">
          This category isn’t available.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Seo
        title={`${copy.title} | Blog | VisionLink AI`}
        description={copy.description}
        pathname={`/blog/category/${slug}`}
        imagePath={DEFAULT_OG_IMAGE_PATH}
      />
      <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground">{copy.description}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Posts will be added here (MDX/content pipeline is implemented next).
      </p>
    </div>
  );
}
