import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Feature = { title: string; body: string; bullets: string[] };

export function FeatureDetailSection(props: {
  title: string;
  features: Feature[];
}) {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container py-12">
        <SectionHeading
          title={props.title}
          description="Production features are delivered in phases; the platform is designed to scale into them cleanly."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {props.features.map((f) => (
            <Card key={f.title} className="border-border/60">
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{f.body}</p>
                <ul className="list-disc space-y-1 pl-5">
                  {f.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
