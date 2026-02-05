import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="border-b border-border/60">
      <div className="container py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Badge
              variant="outline"
              className="border-border/60 bg-background/60"
            >
              AI-native remote desktop
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              AI-Powered Remote Desktop for{" "}
              <span className="text-primary">RPA</span> &{" "}
              <span className="text-primary">Web Scraping</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Enterprise remote desktop software with AI-powered automation for
              RPA, web scraping, and IT support. Orchestrate secure sessions,
              connect automation agents, and run human-approved AI steps—built
              on Cloudflare Workers + Durable Objects. 10x faster than
              TeamViewer with 99.9% uptime SLA.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/trial">Start free trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Target: 99.9% control plane availability. No credit card required
              for trial. Join 500+ companies using VisionLink AI for automation.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-transparent blur-2xl" />
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Live session</div>
                <Badge>Connecting</Badge>
              </div>
              <div
                className="mt-4 h-44 rounded-xl bg-muted"
                aria-hidden="true"
              />
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Signaling</span>
                  <span className="text-foreground">WebSocket (DO)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Media</span>
                  <span className="text-foreground">WebRTC (P2P)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI mode</span>
                  <span className="text-foreground">Recommend → approve</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
