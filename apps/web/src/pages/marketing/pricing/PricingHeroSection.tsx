import { useState } from "react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type BillingCadence = "monthly" | "annual";

export function PricingHeroSection(props: {
  cadence: BillingCadence;
  onCadenceChange: (cadence: BillingCadence) => void;
}) {
  const [focused, setFocused] = useState<"monthly" | "annual" | null>(null);

  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="container py-12">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent plans"
          description="Start free. Scale as you grow. No hidden fees."
        />

        <div className="mt-8 inline-flex rounded-lg border border-border/60 bg-background p-1">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "rounded-md",
              props.cadence === "monthly" && "bg-muted",
            )}
            onClick={() => props.onCadenceChange("monthly")}
            onFocus={() => setFocused("monthly")}
            onBlur={() => setFocused(null)}
            aria-pressed={props.cadence === "monthly"}
          >
            Monthly
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "rounded-md",
              props.cadence === "annual" && "bg-muted",
            )}
            onClick={() => props.onCadenceChange("annual")}
            onFocus={() => setFocused("annual")}
            onBlur={() => setFocused(null)}
            aria-pressed={props.cadence === "annual"}
          >
            Annual{" "}
            <span
              className={cn(
                "ml-1 text-xs",
                focused === "annual"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              (Save 20%)
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
