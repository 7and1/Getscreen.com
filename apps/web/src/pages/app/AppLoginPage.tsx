import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFormValidation } from "@/hooks/useFormValidation";

const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .regex(/^vl_api_/, "API key must start with 'vl_api_'"),
});

export function AppLoginPage() {
  const navigate = useNavigate();
  const setApiKey = useAuthStore((s) => s.setApiKey);
  const [apiKey, setLocalApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate, clearFieldError } = useFormValidation(apiKeySchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate({ apiKey })) {
      return;
    }

    setIsSubmitting(true);
    // Simulate async operation
    setTimeout(() => {
      setApiKey(apiKey);
      navigate("/app/devices");
    }, 300);
  };

  return (
    <div className="max-w-lg">
      <Seo title="Connect API key | VisionLink AI" noindex />
      <h1 className="text-2xl font-semibold tracking-tight">Connect API key</h1>
      <p className="mt-2 text-muted-foreground">
        For MVP, the app uses API-key auth. Store it locally in your browser.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">X-API-Key</Label>
          <Input
            id="apiKey"
            value={apiKey}
            onChange={(e) => {
              setLocalApiKey(e.target.value);
              clearFieldError("apiKey");
            }}
            placeholder="vl_api_..."
            autoComplete="off"
            aria-invalid={!!errors.apiKey}
            aria-describedby={errors.apiKey ? "apiKey-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.apiKey && (
            <p id="apiKey-error" className="text-sm text-red-600" role="alert">
              {errors.apiKey}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting || !apiKey.trim()}>
          {isSubmitting ? "Connecting..." : "Save and continue"}
        </Button>

        <Alert>
          <AlertDescription className="text-xs">
            Your API key is stored locally in your browser and never sent to
            third parties.
          </AlertDescription>
        </Alert>

        <p className="text-xs text-muted-foreground">
          Don’t have an API key?{" "}
          <Link
            to="/get-started"
            className="text-foreground underline underline-offset-4"
          >
            Create one for free
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
