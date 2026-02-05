import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI-powered reliability",
    description:
      "Human-in-the-loop automation by default, with auditable steps and clear safety rails. AI suggests actions, operators approve. High-risk steps require confirmation by policy, ensuring safe automation at scale.",
  },
  {
    title: "Session orchestration",
    description:
      "Durable Objects coordinate roles, signaling, presence, and policy checks with strong consistency. Edge-first orchestration for reliable signaling and predictable session setup across distributed fleets.",
  },
  {
    title: "API-first platform",
    description:
      "Use REST APIs for inventory and sessions; use WebSockets for real-time signaling and control. Integrate with UiPath, Automation Anywhere, and custom RPA workflows via comprehensive API.",
  },
  {
    title: "Fleet visibility",
    description:
      "Track devices, status, tags, and usage meters so ops teams can scale safely. Monitor session status and device health across environments with real-time presence and audit-ready events.",
  },
  {
    title: "Security posture",
    description:
      "Short-lived tokens, least-privilege roles, and a foundation for SOC2/GDPR programs. Enterprise-grade security with role-based access controls, token expiry, and comprehensive audit logging.",
  },
  {
    title: "Global edge",
    description:
      "Edge-first control plane on Cloudflare for low latency session setup and resilient coordination. Deploy globally with 99.9% uptime SLA and sub-100ms latency for session signaling.",
  },
];

export function FeatureGridSection() {
  return (
    <section className="container py-12">
      <SectionHeading
        eyebrow="Everything you need"
        title="Enterprise-grade building blocks"
        description="Start with MVP-ready session flows, then grow into AI-assisted automation, artifacts, and usage insights."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="border-border/60">
            <CardHeader>
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {f.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
