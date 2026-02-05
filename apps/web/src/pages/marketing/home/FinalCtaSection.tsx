import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <section className="container py-14">
      <Card className="border-border/60 bg-card p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to accelerate automation?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start with a free trial, connect a device, and create your first
              session in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/trial">Start free trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app">Open app</Link>
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>✓ Short-lived tokens and role-based sessions</li>
              <li>✓ Edge-first orchestration (Workers + Durable Objects)</li>
              <li>✓ AI suggestions with explicit approvals</li>
              <li>✓ D1-based metadata and billing meters</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
