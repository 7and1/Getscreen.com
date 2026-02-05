import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useConsentStore } from "@/stores/useConsentStore";

export function CookieConsentBanner() {
  const decidedAt = useConsentStore((s) => s.decided_at);
  const acceptAll = useConsentStore((s) => s.acceptAll);
  const rejectAll = useConsentStore((s) => s.rejectAll);
  const save = useConsentStore((s) => s.save);
  const analytics = useConsentStore((s) => s.analytics);
  const marketing = useConsentStore((s) => s.marketing);

  const [open, setOpen] = useState(false);
  const [localAnalytics, setLocalAnalytics] = useState(analytics);
  const [localMarketing, setLocalMarketing] = useState(marketing);

  const show = decidedAt === null;
  const prefsChanged = useMemo(
    () => localAnalytics !== analytics || localMarketing !== marketing,
    [analytics, localAnalytics, localMarketing, marketing],
  );

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <Card className="mx-auto max-w-3xl border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">
              Cookie preferences
            </div>
            <div className="mt-1">
              We use cookies and similar technologies for analytics and
              marketing. You can accept, reject, or customize your preferences.{" "}
              <Link
                className="text-foreground underline underline-offset-4"
                to="/privacy"
              >
                Learn more
              </Link>
              .
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={rejectAll}>
              Reject
            </Button>
            <Dialog.Root
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                setLocalAnalytics(analytics);
                setLocalMarketing(marketing);
              }}
            >
              <Dialog.Trigger asChild>
                <Button type="button" variant="ghost">
                  Preferences
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-5 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold">
                    Cookie preferences
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                    Choose which categories to enable. Necessary cookies are
                    always on.
                  </Dialog.Description>

                  <div className="mt-5 space-y-4 text-sm">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="mt-1"
                      />
                      <span>
                        <div className="font-medium">Necessary</div>
                        <div className="text-muted-foreground">
                          Required for site functionality.
                        </div>
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={localAnalytics}
                        onChange={(e) => setLocalAnalytics(e.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        <div className="font-medium">Analytics</div>
                        <div className="text-muted-foreground">
                          Helps us understand usage and improve performance.
                        </div>
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={localMarketing}
                        onChange={(e) => setLocalMarketing(e.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        <div className="font-medium">Marketing</div>
                        <div className="text-muted-foreground">
                          Used for personalized ads and retargeting.
                        </div>
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        save({
                          analytics: localAnalytics,
                          marketing: localMarketing,
                        });
                        setOpen(false);
                      }}
                      className={cn(!prefsChanged && "opacity-80")}
                    >
                      Save
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <Button type="button" onClick={acceptAll}>
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
