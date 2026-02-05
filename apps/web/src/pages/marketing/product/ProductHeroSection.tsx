import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductHeroSection(props: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
  imageAlt: string;
}) {
  return (
    <section className="border-b border-border/60">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Badge
              variant="outline"
              className="border-border/60 bg-background/60"
            >
              {props.eyebrow}
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {props.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              {props.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={props.ctaTo}>{props.ctaLabel}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app">Open app</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-transparent blur-2xl" />
            <div
              className="aspect-[16/10] rounded-2xl border border-border/60 bg-muted"
              aria-label={props.imageAlt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
