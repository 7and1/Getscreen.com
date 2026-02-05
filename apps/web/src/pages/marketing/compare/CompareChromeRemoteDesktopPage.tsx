import { CompareTemplate } from "@/pages/marketing/compare/CompareTemplate";

export function CompareChromeRemoteDesktopPage() {
  return (
    <CompareTemplate
      pathname="/compare/chrome-remote-desktop-alternative"
      competitorName="Chrome Remote Desktop"
      title="Chrome Remote Desktop Alternative for Automation | VisionLink AI"
      description="Chrome Remote Desktop is simple, but VisionLink AI is designed for automation fleets, APIs, and auditable sessions."
      rows={[
        {
          feature: "Multi-tenant org model",
          visionlink: "Org-scoped devices and keys",
          competitor: "Google account-centric",
        },
        {
          feature: "Automation + approvals",
          visionlink: "Propose → approve workflow",
          competitor: "No native automation framework",
        },
        {
          feature: "Usage metering",
          visionlink: "Devices/AI steps/bandwidth meters",
          competitor: "Not designed for billing meters",
        },
      ]}
    />
  );
}
