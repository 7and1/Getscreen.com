import { Seo } from "@/components/Seo";

export function PrivacyPage() {
  return (
    <div className="container py-12">
      <Seo title="Privacy Policy | VisionLink AI" pathname="/privacy" />
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        This is a starter privacy policy page. Replace with your final policy
        before production launch.
      </p>
    </div>
  );
}

export default PrivacyPage;
