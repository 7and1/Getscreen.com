import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ApiError,
  createPairingCode,
  createSession,
  listDevices,
  pairDevice,
  type Device,
} from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "outline" {
  if (status === "online") return "default";
  if (status === "offline") return "outline";
  return "secondary";
}

export function DevicesPage() {
  const navigate = useNavigate();
  const apiKey = useAuthStore((s) => s.apiKey);

  const [devices, setDevices] = useState<Device[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pairingNameHint, setPairingNameHint] = useState("");
  const [pairingCode, setPairingCode] = useState<{
    code: string;
    expires_at: string;
  } | null>(null);
  const [pairDeviceName, setPairDeviceName] = useState("");
  const [pairedDeviceToken, setPairedDeviceToken] = useState<string | null>(
    null,
  );
  const [sessionCreating, setSessionCreating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Device | null>(null);

  const canLoadMore = useMemo(() => Boolean(nextCursor), [nextCursor]);

  async function refresh() {
    if (!apiKey) return;
    try {
      setLoading(true);
      setError(null);
      const res = await listDevices(apiKey, { limit: 20, cursor: null });
      setDevices(res.items);
      setNextCursor(res.next_cursor);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.code}: ${err.message}`
          : "Failed to load devices",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!apiKey || !nextCursor) return;
    try {
      setLoading(true);
      setError(null);
      const res = await listDevices(apiKey, { limit: 20, cursor: nextCursor });
      setDevices((prev) => [...prev, ...res.items]);
      setNextCursor(res.next_cursor);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.code}: ${err.message}`
          : "Failed to load devices",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div>
        <Seo title="Devices | VisionLink AI" noindex />
        <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
        <p className="mt-2 text-muted-foreground">Connect an API key first.</p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/app/login">Connect API key</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Seo title="Devices | VisionLink AI" noindex />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your device fleet and start sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fleet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && devices.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-md border border-border/60 p-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-2 h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No devices yet. Create a pairing code to enroll one.
              </p>
            ) : (
              <div className="space-y-2">
                {devices.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col gap-2 rounded-md border border-border/60 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium">{d.name}</div>
                        <Badge variant={statusBadgeVariant(d.status)}>
                          {d.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{d.id}</span>
                        {d.tags.length > 0 ? (
                          <span className="ml-2">
                            · tags: {d.tags.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            setSessionCreating(d.id);
                            setError(null);
                            const session = await createSession(apiKey, {
                              device_id: d.id,
                              purpose: "support",
                              expires_in_seconds: 1800,
                            });
                            navigate(`/app/sessions/${session.id}`, {
                              state: {
                                controller_token: session.session_token,
                                ws_url: session.ws_url,
                              },
                            });
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? `${err.code}: ${err.message}`
                                : "Failed to create session",
                            );
                          } finally {
                            setSessionCreating(null);
                          }
                        }}
                        disabled={sessionCreating === d.id || d.status === "offline"}
                      >
                        {sessionCreating === d.id ? "Starting..." : "Start session"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadMore()}
                disabled={loading || !canLoadMore}
              >
                Load more
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Pair a device</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hint">Device name hint (optional)</Label>
              <Input
                id="hint"
                value={pairingNameHint}
                onChange={(e) => setPairingNameHint(e.target.value)}
                placeholder="e.g. VPS-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    setPairedDeviceToken(null);
                    const code = await createPairingCode(apiKey, {
                      device_name_hint: pairingNameHint || undefined,
                      expires_in_seconds: 600,
                    });
                    setPairingCode(code);
                  } catch (err) {
                    setError(
                      err instanceof ApiError
                        ? `${err.code}: ${err.message}`
                        : "Failed to create pairing code",
                    );
                  }
                }}
              >
                Create pairing code
              </Button>
            </div>

            {pairingCode ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
                <div className="font-medium">Pairing code</div>
                <div className="mt-1 font-mono text-xs">{pairingCode.code}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Expires at {new Date(pairingCode.expires_at).toLocaleString()}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Simulate device enrollment (dev)
              </div>
              <Label htmlFor="devName" className="text-xs text-muted-foreground">
                Device name
              </Label>
              <Input
                id="devName"
                value={pairDeviceName}
                onChange={(e) => setPairDeviceName(e.target.value)}
                placeholder="My Linux VPS"
              />
              <Button
                type="button"
                disabled={!pairingCode?.code}
                onClick={async () => {
                  if (!pairingCode?.code) return;
                  try {
                    setError(null);
                    const device = await pairDevice(apiKey, {
                      code: pairingCode.code,
                      name: pairDeviceName || undefined,
                      agent: { os: "linux", arch: "x64", version: "0.0.1" },
                      tags: ["dev"],
                    });
                    setPairedDeviceToken(device.device_token ?? null);
                    await refresh();
                  } catch (err) {
                    setError(
                      err instanceof ApiError
                        ? `${err.code}: ${err.message}`
                        : "Failed to pair device",
                    );
                  }
                }}
              >
                Enroll device
              </Button>
              {pairedDeviceToken ? (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
                  <div className="font-medium">
                    Device token (store securely)
                  </div>
                  <div className="mt-1 font-mono break-all">
                    {pairedDeviceToken}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete device</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{confirmDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // TODO: Implement device deletion
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
