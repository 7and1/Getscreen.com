import { useState } from "react";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackEvent } from "@/lib/analytics";
import { useFormValidation } from "@/hooks/useFormValidation";

const trialSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function TrialPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate, clearFieldError } = useFormValidation(trialSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate({ email })) {
      return;
    }

    setIsSubmitting(true);
    trackEvent("trial_signup_started", { source: "trial_page" });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
    trackEvent("trial_signup_completed", { source: "trial_page" });
  };

  return (
    <div className="container py-12">
      <Seo
        title="Start Free Trial - 14 Days No Credit Card Required | VisionLink AI"
        description="Start your VisionLink AI free trial. 14 days full access to RPA automation and web scraping platform. No credit card required."
        keywords="free trial, remote desktop free trial, RPA automation trial, web scraping trial"
        pathname="/trial"
      />
      <h1 className="text-3xl font-semibold tracking-tight">
        Start a free trial
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        No credit card required. We'll email you next steps.
      </p>

      <div className="mt-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={isSubmitting || submitted}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email.trim() || isSubmitting || submitted}
              >
                {isSubmitting ? "Starting trial..." : submitted ? "Trial started" : "Start trial"}
              </Button>

              <p className="text-xs text-muted-foreground">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </CardContent>
        </Card>

        {submitted && (
          <Alert className="mt-4" variant="success">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Thanks for signing up! Check your email for next steps.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
