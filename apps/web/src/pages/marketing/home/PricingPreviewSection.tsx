import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingPreviewSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container py-12">
        <SectionHeading
          eyebrow="Free"
          title="No plans. No billing."
          description="Create a free API key, connect devices, and run sessions. No credit card required."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Free API key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a workspace and API key in seconds.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>No credit card</li>
                <li>Stored locally in your browser</li>
                <li>Use it for API + app</li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/get-started">Get started free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Devices + sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Build reliable session flows with a minimal surface area.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Device enrollment + tags</li>
                <li>Session creation + join roles</li>
                <li>WebSocket signaling (Durable Objects)</li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link to="/app">Open app</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Safety defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Security-first primitives baked into the platform.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Short-lived join tokens</li>
                <li>Rate limiting (Durable Objects)</li>
                <li>Audit-style event logging</li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link to="/resources/documentation">Read docs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
