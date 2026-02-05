import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BillingCadence } from "@/pages/marketing/pricing/PricingHeroSection";

type Plan = {
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  cta: { label: string; to: string };
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    description: "Perfect for small teams and side projects",
    monthlyPrice: "$29",
    annualPrice: "$279",
    features: [
      "5 concurrent sessions",
      "10,000 API requests / month",
      "99.9% uptime target",
      "Email support (24h response)",
      "Basic analytics",
      "Community access",
    ],
    cta: { label: "Start Free Trial", to: "/trial" },
  },
  {
    name: "Professional",
    description: "For growing businesses and automation teams",
    monthlyPrice: "$99",
    annualPrice: "$949",
    features: [
      "50 concurrent sessions",
      "100,000 API requests / month",
      "99.9% uptime target",
      "Priority email support (4h response)",
      "Advanced analytics",
      "API access",
      "Webhooks",
      "Custom integrations",
    ],
    cta: { label: "Start Free Trial", to: "/trial" },
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale operations and enterprises",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    features: [
      "Unlimited concurrent sessions",
      "Unlimited API requests",
      "99.99% uptime target",
      "24/7 phone support",
      "Dedicated account manager",
      "Custom integrations",
      "Dedicated infrastructure options",
      "SLA guarantees",
      "Training and onboarding",
    ],
    cta: { label: "Contact Sales", to: "/trial" },
  },
];

export function PricingPlansSection(props: { cadence: BillingCadence }) {
  return (
    <section className="container py-12">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{p.name}</CardTitle>
                {p.featured ? (
                  <Badge className="bg-primary text-primary-foreground">
                    Most popular
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-semibold tracking-tight">
                {props.cadence === "annual" ? p.annualPrice : p.monthlyPrice}
                {p.monthlyPrice !== "Custom" ? (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {props.cadence === "annual" ? "/year" : "/month"}
                  </span>
                ) : null}
              </div>

              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={p.featured ? "default" : "outline"}
              >
                <Link to={p.cta.to}>{p.cta.label}</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                {p.name === "Enterprise"
                  ? "Custom pricing and terms."
                  : "14-day free trial. No credit card required."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
