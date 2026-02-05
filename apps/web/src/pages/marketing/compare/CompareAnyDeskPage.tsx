import { CompareTemplate } from "@/pages/marketing/compare/CompareTemplate";

export function CompareAnyDeskPage() {
  return (
    <CompareTemplate
      pathname="/compare/anydesk-alternative"
      competitorName="AnyDesk"
      title="VisionLink AI vs AnyDesk - Automation-Friendly Remote Desktop | VisionLink AI"
      description="Compare VisionLink AI and AnyDesk for automation use cases and fleet-scale operations."
      rows={[
        {
          feature: "Automation workflows",
          visionlink: "AI-assisted steps with approvals",
          competitor: "Primarily human remote control",
        },
        {
          feature: "API-first control plane",
          visionlink: "Session and device lifecycle APIs",
          competitor: "Varies by plan/integration",
        },
        {
          feature: "Auditability",
          visionlink: "D1-backed audit indices (MVP+)",
          competitor: "Depends on enterprise configuration",
        },
      ]}
    />
  );
}
