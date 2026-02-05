import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Pro",
    price: "$29",
    note: "For small teams",
    features: ["10 devices", "Bandwidth included", "No recording"],
  },
  {
    name: "Business",
    price: "$99",
    note: "Most popular",
    featured: true,
    features: [
      "50 devices",
      "1,000 AI steps / month",
      "Recording + audit basics",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "For large-scale ops",
    features: ["Unlimited devices", "Unlimited AI steps", "SLA + compliance"],
  },
];

export function PricingPreviewSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container py-12">
        <SectionHeading
          eyebrow="Transparent pricing"
          title="Start free. Scale when you’re ready."
          description="All plans are designed to map cost to usage: devices, AI steps, and bandwidth."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-semibold tracking-tight">
                  {p.price}
                </div>
                <p className="text-sm text-muted-foreground">{p.note}</p>
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
                  <Link to={p.name === "Enterprise" ? "/pricing" : "/trial"}>
                    {p.name === "Enterprise" ? "View details" : "Start trial"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
