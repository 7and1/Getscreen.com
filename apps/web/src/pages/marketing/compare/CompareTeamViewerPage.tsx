import { CompareTemplate } from "@/pages/marketing/compare/CompareTemplate";

export function CompareTeamViewerPage() {
  return (
    <CompareTemplate
      pathname="/compare/teamviewer-alternative"
      competitorName="TeamViewer"
      title="VisionLink AI vs TeamViewer - Feature Comparison (Free Tool)"
      description="Compare VisionLink AI and TeamViewer for automation workloads, reliability, and API-first orchestration."
      rows={[
        {
          feature: "Automation-first design",
          visionlink: "Built for RPA and scraping workflows",
          competitor: "General-purpose remote support",
        },
        {
          feature: "Session orchestration API",
          visionlink: "REST + WebSocket signaling contracts",
          competitor: "Limited automation APIs",
        },
        {
          feature: "AI workflow (approve-by-default)",
          visionlink: "Structured steps + explicit approvals",
          competitor: "Not the default model",
        },
        {
          feature: "Fleet model",
          visionlink: "Devices + tags + usage meters",
          competitor: "Device management varies by plan",
        },
      ]}
    />
  );
}
