import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faq = [
  {
    q: "What's included in the free trial?",
    a: "All plans include a 14-day free trial with access to core features. No credit card required.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes. You can upgrade or downgrade at any time. Plan changes take effect immediately.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit cards. Annual invoicing and wire transfer can be arranged for Enterprise.",
  },
  {
    q: "Do you offer discounts for annual plans?",
    a: "Yes. Annual billing includes a 20% discount compared to monthly.",
  },
  {
    q: "What happens if I exceed plan limits?",
    a: "You’ll get notifications and can upgrade or purchase add-ons. We avoid hard cutoffs without warning.",
  },
];

export function PricingFaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section className="container py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <SectionHeading
        title="Pricing FAQ"
        description="Answers to common billing and plan questions."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {faq.map((f) => (
          <Card key={f.q} className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{f.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {f.a}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
