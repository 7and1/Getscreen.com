import { CompareTemplate } from "@/pages/marketing/compare/CompareTemplate";

export function CompareOctoparsePage() {
  return (
    <CompareTemplate
      pathname="/compare/octoparse-alternative"
      competitorName="Octoparse"
      title="Octoparse Alternative for Portal Scraping | VisionLink AI"
      description="Compare VisionLink AI and Octoparse for portal scraping workflows that benefit from real browser sessions and strong auditability."
      rows={[
        {
          feature: "Portal automation",
          visionlink: "Browser-first sessions + action protocol",
          competitor: "Scraping tool with UI workflows",
        },
        {
          feature: "Fleet scaling model",
          visionlink: "Devices + sessions + rate limiting",
          competitor: "Primarily job-based scraping",
        },
        {
          feature: "AI recommendations",
          visionlink: "Suggest → approve → execute loop",
          competitor: "Varies by feature set",
        },
      ]}
    />
  );
}
