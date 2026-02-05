import { CompareTemplate } from "@/pages/marketing/compare/CompareTemplate";

export function CompareParsehubPage() {
  return (
    <CompareTemplate
      pathname="/compare/parsehub-alternative"
      competitorName="ParseHub"
      title="ParseHub Alternative for Browser Automation | VisionLink AI"
      description="Compare VisionLink AI and ParseHub for browser-first extraction, automation guardrails, and fleet orchestration."
      rows={[
        {
          feature: "Remote desktop sessions",
          visionlink: "WebRTC sessions to real devices",
          competitor: "Scraping tool (not remote desktop)",
        },
        {
          feature: "Human approvals",
          visionlink: "Approval gates built-in",
          competitor: "Workflow approval depends on team process",
        },
        {
          feature: "API orchestration",
          visionlink: "Sessions + devices + WS signaling",
          competitor: "Export APIs vary by plan",
        },
      ]}
    />
  );
}
