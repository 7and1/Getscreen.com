import { z } from "zod";

const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details?: unknown;

  constructor(opts: {
    status: number;
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
    this.details = opts.details;
  }
}

function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (fromEnv && fromEnv.trim()) || "http://localhost:8787/v1";
}

function joinUrl(base: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedBase = base.replace(/\/+$/g, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseOrThrow<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: unknown = null;
  let parsedJson = false;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
      parsedJson = true;
    } catch {
      json = null;
      parsedJson = false;
    }
  }

  if (!response.ok) {
    const parsed = parsedJson ? apiErrorSchema.safeParse(json) : null;
    if (parsed?.success) {
      throw new ApiError({
        status: response.status,
        code: parsed.data.error.code,
        message: parsed.data.error.message,
        requestId: parsed.data.error.request_id,
        details: parsed.data.error.details,
      });
    }
    throw new ApiError({
      status: response.status,
      code: "HTTP_ERROR",
      message: "Request failed",
      details: parsedJson ? json : text,
    });
  }

  if (!text) return null as T;
  if (!parsedJson) {
    throw new ApiError({
      status: response.status,
      code: "INVALID_JSON",
      message: "Invalid JSON response",
      details: text,
    });
  }

  return json as T;
}

export type Device = {
  id: string;
  name: string;
  status: string;
  last_seen_at: string | null;
  tags: string[];
  device_token?: string;
};

export type DeviceListResponse = {
  items: Device[];
  next_cursor: string | null;
};

export type PairingCodeResponse = { code: string; expires_at: string };

export type PairDeviceRequest = {
  code: string;
  name?: string;
  agent?: {
    os: "Windows" | "Linux" | "macOS" | "windows" | "linux" | "macos";
    arch?: string;
    version?: string;
  };
  tags?: string[];
};

export type CreateSessionRequest = {
  device_id: string;
  purpose?: string;
  expires_in_seconds?: number;
};

export type IceServer = {
  urls: string[];
  username?: string;
  credential?: string;
};

export type CreateSessionResponse = {
  id: string;
  status: string;
  device_id: string;
  created_at: string;
  expires_at: string;
  session_token: string;
  ws_url: string;
  ice_servers: IceServer[];
};

export type Session = {
  id: string;
  status: string;
  device_id: string;
  created_at: string;
  ended_at?: string | null;
};

export type SessionJoinResponse = {
  session_id: string;
  join_token: string;
  ws_url: string;
};

export type RegisterRequest = {
  email: string;
  org_name?: string;
  display_name?: string;
};

export type RegisterResponse = {
  org: { id: string; name: string };
  user: { id: string; email: string; display_name?: string };
  api_key: { id: string; key: string };
};

export async function apiRequest<T>(opts: {
  path: string;
  method?: string;
  apiKey?: string | null;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}): Promise<T> {
  const base = getApiBaseUrl();
  const url = new URL(joinUrl(base, opts.path));
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v === undefined || v === null) continue;
    url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (opts.apiKey) headers["X-API-Key"] = opts.apiKey;

  const response = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  return parseOrThrow<T>(response);
}

export function register(body: RegisterRequest) {
  return apiRequest<RegisterResponse>({
    path: "/auth/register",
    method: "POST",
    body,
  });
}

export function listDevices(
  apiKey: string,
  args: { limit?: number; cursor?: string | null } = {},
) {
  return apiRequest<DeviceListResponse>({
    path: "/devices",
    apiKey,
    query: { limit: args.limit ?? 20, cursor: args.cursor ?? undefined },
  });
}

export function createPairingCode(
  apiKey: string,
  args: { device_name_hint?: string; expires_in_seconds?: number } = {},
) {
  return apiRequest<PairingCodeResponse>({
    path: "/devices/pairing-codes",
    method: "POST",
    apiKey,
    body: args,
  });
}

export function pairDevice(apiKey: string, body: PairDeviceRequest) {
  return apiRequest<Device>({
    path: "/devices/pair",
    method: "POST",
    apiKey,
    body,
  });
}

export function createSession(apiKey: string, body: CreateSessionRequest) {
  return apiRequest<CreateSessionResponse>({
    path: "/sessions",
    method: "POST",
    apiKey,
    body,
  });
}

export function getSession(apiKey: string, id: string) {
  return apiRequest<Session>({ path: `/sessions/${id}`, apiKey });
}

export function joinSession(
  apiKey: string,
  id: string,
  role: "controller" | "observer" | "agent",
) {
  return apiRequest<SessionJoinResponse>({
    path: `/sessions/${id}/join`,
    method: "POST",
    apiKey,
    body: { role },
  });
}
