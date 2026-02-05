import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const addons = [
  {
    title: "Additional sessions",
    price: "$5 / session / month",
    description: "Add more concurrent sessions as needed.",
  },
  {
    title: "API requests",
    price: "$10 / 100K requests",
    description: "Additional API request capacity.",
  },
  {
    title: "Premium support",
    price: "$500 / month",
    description: "24/7 phone support with 1h response target.",
  },
  {
    title: "Dedicated infrastructure",
    price: "Custom",
    description: "Isolated infrastructure options for compliance.",
  },
];

export function PricingAddOnsSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container py-12">
        <SectionHeading
          title="Add-ons"
          description="Scale capacity and support as your fleet grows."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {addons.map((a) => (
            <Card key={a.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{a.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">{a.price}</div>
                <div>{a.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
