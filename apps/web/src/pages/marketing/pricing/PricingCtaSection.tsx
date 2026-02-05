import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PricingCtaSection() {
  return (
    <section className="container py-12">
      <Card className="border-border/60 bg-card p-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Ready to get started?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start your 14-day free trial today. No credit card required.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/trial">Start Free Trial</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
