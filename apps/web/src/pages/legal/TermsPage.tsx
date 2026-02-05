import { Seo } from "@/components/Seo";

export function TermsPage() {
  return (
    <div className="container py-12">
      <Seo title="Terms of Service | VisionLink AI" pathname="/terms" />
      <h1 className="text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        This is a starter terms page. Replace with your final terms before
        production launch.
      </p>
    </div>
  );
}
