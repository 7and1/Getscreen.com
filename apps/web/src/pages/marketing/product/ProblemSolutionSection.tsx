import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProblemSolutionSection(props: {
  title: string;
  problems: Array<{ title: string; body: string }>;
  solutionsTitle: string;
  solutions: Array<{ title: string; body: string }>;
}) {
  return (
    <section className="container py-12">
      <SectionHeading title={props.title} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {props.problems.map((p) => (
          <Card key={p.title} className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {p.body}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <SectionHeading title={props.solutionsTitle} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {props.solutions.map((s) => (
            <Card key={s.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {s.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
