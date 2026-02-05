import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackEvent } from "@/lib/analytics";
import { useFormValidation } from "@/hooks/useFormValidation";
import { register } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

const getStartedSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function GetStartedPage() {
  const navigate = useNavigate();
  const setApiKey = useAuthStore((s) => s.setApiKey);
  const [email, setEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { errors, validate, clearFieldError } =
    useFormValidation(getStartedSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate({ email })) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setCopied(false);
    trackEvent("free_signup_started", { source: "get_started_page" });

    try {
      const res = await register({ email });
      const key = res.api_key.key;
      setGeneratedKey(key);
      setApiKey(key);
      setSubmitted(true);
      trackEvent("free_signup_completed", { source: "get_started_page" });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
      trackEvent("free_signup_failed", { source: "get_started_page" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <Seo
        title="Get started free | VisionLink AI"
        description="Create a free workspace and API key to start using VisionLink AI. No credit card required."
        keywords="free remote desktop, RPA automation, web scraping, API key"
        pathname="/get-started"
      />
      <h1 className="text-3xl font-semibold tracking-tight">
        Get started — free
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Create a free workspace and an API key. No credit card required.
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
                  <p
                    id="email-error"
                    className="text-sm text-red-600"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email.trim() || isSubmitting || submitted}
              >
                {isSubmitting
                  ? "Creating..."
                  : submitted
                    ? "Created"
                    : "Create free API key"}
              </Button>

              <p className="text-xs text-muted-foreground">
                We only use your email for account recovery and security
                notices.
              </p>
            </form>
          </CardContent>
        </Card>

        {errorMessage ? (
          <Alert className="mt-4" variant="destructive">
            <AlertTitle>Couldn’t create account</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {submitted && (
          <Alert className="mt-4" variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your API key is ready. It’s saved locally in this browser.
            </AlertDescription>
          </Alert>
        )}

        {generatedKey ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API key</Label>
              <Input id="apiKey" value={generatedKey} readOnly />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedKey);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" onClick={() => navigate("/app/devices")}>
                Open app
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
