import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "“The human-in-the-loop workflow keeps automation safe while still moving fast. It’s the right default.”",
    by: "Automation lead, SaaS",
  },
  {
    quote:
      "“Session orchestration at the edge is a game changer for reliability in distributed fleets.”",
    by: "Platform engineer, data company",
  },
  {
    quote:
      "“Our goal: fewer manual interventions, clearer audit trails, and faster time-to-first-frame.”",
    by: "Ops manager, e-commerce",
  },
];

export function TestimonialsSection() {
  return (
    <section className="container py-12">
      <SectionHeading
        eyebrow="Why teams adopt it"
        title="Designed for scale and auditability"
        description="A control plane that makes it easier to connect, supervise, and automate desktop workflows."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.by} className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t.by}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t.quote}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
