import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  ApiError,
  getSession,
  joinSession,
  type SessionJoinResponse,
} from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

type WsLogItem = {
  id: string;
  ts: string;
  role: "controller" | "agent";
  direction: "in" | "out";
  data: unknown;
};

type LocationState = {
  controller_token?: string;
  ws_url?: string;
};

function wsUrlWithToken(wsUrl: string, token: string): string {
  const url = new URL(wsUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function SessionPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const apiKey = useAuthStore((s) => s.apiKey);
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [controllerJoin, setControllerJoin] =
    useState<SessionJoinResponse | null>(null);
  const [agentJoin, setAgentJoin] = useState<SessionJoinResponse | null>(null);

  const [controllerConnected, setControllerConnected] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);

  const controllerWsRef = useRef<WebSocket | null>(null);
  const agentWsRef = useRef<WebSocket | null>(null);

  const [log, setLog] = useState<WsLogItem[]>([]);
  const [outgoingType, setOutgoingType] = useState("offer");
  const [outgoingPayload, setOutgoingPayload] = useState(
    '{"sdp":"v=0\\r\\n..."}',
  );

  const wsBaseUrl = useMemo(
    () => state.ws_url ?? controllerJoin?.ws_url ?? null,
    [controllerJoin?.ws_url, state.ws_url],
  );
  const controllerToken = useMemo(
    () => state.controller_token ?? controllerJoin?.join_token ?? null,
    [controllerJoin?.join_token, state.controller_token],
  );

  useEffect(() => {
    if (!apiKey || !sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const session = await getSession(apiKey, sessionId);
        if (cancelled) return;
        setSessionStatus(session.status);

        // Ensure we have a controller join token and ws url for browser WS auth (query token).
        if (!state.controller_token || !state.ws_url) {
          const join = await joinSession(apiKey, sessionId, "controller");
          if (cancelled) return;
          setControllerJoin(join);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? `${err.code}: ${err.message}`
            : "Failed to load session",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey, sessionId, state.controller_token, state.ws_url]);

  useEffect(() => {
    return () => {
      controllerWsRef.current?.close();
      agentWsRef.current?.close();
    };
  }, []);

  function appendLog(item: Omit<WsLogItem, "id">) {
    setLog((prev) => {
      const next = [...prev, { ...item, id: crypto.randomUUID() }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }

  function connect(role: "controller" | "agent", token: string, wsUrl: string) {
    const url = wsUrlWithToken(wsUrl, token);
    const ws = new WebSocket(url);

    ws.addEventListener("open", () => {
      if (role === "controller") setControllerConnected(true);
      if (role === "agent") setAgentConnected(true);
    });

    ws.addEventListener("message", (event) => {
      appendLog({
        role,
        direction: "in",
        ts: new Date().toISOString(),
        data: safeJsonParse(String(event.data)),
      });
    });

    ws.addEventListener("close", () => {
      if (role === "controller") setControllerConnected(false);
      if (role === "agent") setAgentConnected(false);
    });

    ws.addEventListener("error", () => {
      appendLog({
        role,
        direction: "in",
        ts: new Date().toISOString(),
        data: { type: "error", message: "WebSocket error" },
      });
    });

    if (role === "controller") controllerWsRef.current = ws;
    if (role === "agent") agentWsRef.current = ws;
  }

  function disconnect(role: "controller" | "agent") {
    const ref = role === "controller" ? controllerWsRef : agentWsRef;
    ref.current?.close(1000, "client disconnect");
    ref.current = null;
    if (role === "controller") setControllerConnected(false);
    if (role === "agent") setAgentConnected(false);
  }

  async function ensureAgentJoin() {
    if (!apiKey || !sessionId) return null;
    if (agentJoin) return agentJoin;
    const join = await joinSession(apiKey, sessionId, "agent");
    setAgentJoin(join);
    return join;
  }

  function sendFrom(role: "controller" | "agent") {
    const ws =
      role === "controller" ? controllerWsRef.current : agentWsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const payload = (() => {
      try {
        return outgoingPayload.trim()
          ? (JSON.parse(outgoingPayload) as unknown)
          : {};
      } catch {
        return { raw: outgoingPayload };
      }
    })();
    const envelope = {
      type: outgoingType,
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      ts: new Date().toISOString(),
      session_id: sessionId,
      payload,
    };
    ws.send(JSON.stringify(envelope));
    appendLog({ role, direction: "out", ts: envelope.ts, data: envelope });
  }

  if (!apiKey) {
    return (
      <div>
        <Seo title="Session | VisionLink AI" noindex />
        <h1 className="text-2xl font-semibold tracking-tight">Session</h1>
        <p className="mt-2 text-muted-foreground">Connect an API key first.</p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/app/login">Connect API key</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div>
        <Seo title="Session | VisionLink AI" noindex />
        <h1 className="text-2xl font-semibold tracking-tight">
          Missing session id
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Seo title={`Session ${sessionId} | VisionLink AI`} noindex />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Session</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{sessionId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sessionStatus ? (
            <Badge variant="outline">{sessionStatus}</Badge>
          ) : null}
          <Button asChild variant="outline">
            <Link to="/app/devices">Back to devices</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          <span>Loading session...</span>
        </div>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Controller (browser)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Connect with the controller join token (sent via `?token=`).
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (!wsBaseUrl || !controllerToken) return;
                  connect("controller", controllerToken, wsBaseUrl);
                }}
                disabled={controllerConnected || !wsBaseUrl || !controllerToken}
              >
                Connect
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => disconnect("controller")}
                disabled={!controllerConnected}
              >
                Disconnect
              </Button>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              <div>
                ws_url:{" "}
                {wsBaseUrl ? (
                  <span className="font-mono">{wsBaseUrl}</span>
                ) : (
                  "—"
                )}
              </div>
              <div>
                token:{" "}
                {controllerToken ? (
                  <span className="font-mono">present</span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">
              Agent simulator (browser)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              For local testing, connect as an agent role to validate controller
              ↔ agent fanout.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={async () => {
                  if (!wsBaseUrl) return;
                  const join = await ensureAgentJoin();
                  if (!join) return;
                  connect("agent", join.join_token, join.ws_url);
                }}
                disabled={agentConnected || !wsBaseUrl}
              >
                Connect
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => disconnect("agent")}
                disabled={!agentConnected}
              >
                Disconnect
              </Button>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              <div>
                token:{" "}
                {agentJoin?.join_token ? (
                  <span className="font-mono">present</span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Send message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">type</Label>
              <Input
                id="type"
                value={outgoingType}
                onChange={(e) => setOutgoingType(e.target.value)}
                placeholder="offer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payload">payload (JSON)</Label>
              <textarea
                id="payload"
                value={outgoingPayload}
                onChange={(e) => setOutgoingPayload(e.target.value)}
                className="h-10 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Message payload"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => sendFrom("controller")}
              disabled={!controllerConnected}
            >
              Send (controller)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => sendFrom("agent")}
              disabled={!agentConnected}
            >
              Send (agent)
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOutgoingType("ping");
                setOutgoingPayload("{}");
              }}
            >
              Ping
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: connect both roles, then send an `offer` from controller and an
            `answer` from agent.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">WebSocket log</CardTitle>
        </CardHeader>
        <CardContent>
          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="space-y-2">
              {log.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      <span className="capitalize">{item.role}</span>{" "}
                      {item.direction === "in" ? "←" : "→"}
                    </div>
                    <div className="text-muted-foreground">{item.ts}</div>
                  </div>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-muted-foreground">
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
