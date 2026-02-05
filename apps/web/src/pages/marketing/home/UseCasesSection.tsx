import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const useCases = [
  {
    title: "RPA automation",
    body: [
      "UiPath / Automation Anywhere / Blue Prism compatible workflows",
      "Unattended automation with scheduled execution (roadmap)",
      "Audit trails and human-in-the-loop approvals",
      "Scale from 10 to 10,000 bots with reliable orchestration",
    ],
    link: "/product/rpa-automation",
  },
  {
    title: "Web scraping",
    body: [
      "Browser-first extraction for complex portals and SPAs",
      "Scale across fleets of distributed devices with anti-detection",
      "Human-approved AI steps for safe automation",
      "IP rotation and CAPTCHA handling built-in",
    ],
    link: "/product/web-scraping",
  },
  {
    title: "E-commerce ops",
    body: [
      "Amazon seller listing automation and bulk updates",
      "Competitor price monitoring across marketplaces",
      "Inventory checks and stock management",
      "eBay dropshipping automation workflows",
    ],
    link: "/use-cases/amazon-sellers",
  },
  {
    title: "IT support",
    body: [
      "Secure remote assistance for enterprise IT teams",
      "Role-based session control with token expiry",
      "Session lifecycle orchestration at the edge",
      "Audit-ready events for compliance requirements",
    ],
    link: "/use-cases/enterprise-it",
  },
];

export function UseCasesSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container py-12">
        <SectionHeading
          eyebrow="Built for your workflow"
          title="Use cases"
          description="VisionLink AI focuses on reliability, scaling, and safe automation for RPA, web scraping, e-commerce operations, and enterprise IT support—without treating the desktop like an afterthought."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {useCases.map((u) => (
            <Card key={u.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="capitalize">{u.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {u.body.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <Button asChild variant="outline">
                  <Link to={u.link}>Learn more</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
