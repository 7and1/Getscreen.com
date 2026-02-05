import { cn } from "@/lib/cn";

export function SectionHeading(props: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", props.className)}>
      {props.eyebrow ? (
        <p className="text-sm font-medium text-muted-foreground">
          {props.eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight md:text-3xl",
          !props.eyebrow && "mt-0",
        )}
      >
        {props.title}
      </h2>
      {props.description ? (
        <p className="mt-3 text-muted-foreground">{props.description}</p>
      ) : null}
    </div>
  );
}
