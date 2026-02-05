import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError, apiRequest } from "@/lib/api";

describe("api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ApiError", () => {
    it("creates error with required fields", () => {
      const error = new ApiError({
        status: 404,
        code: "NOT_FOUND",
        message: "Resource not found",
      });
      expect(error.status).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("Resource not found");
      expect(error.name).toBe("ApiError");
    });

    it("creates error with optional fields", () => {
      const error = new ApiError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        requestId: "req_123",
        details: { field: "email" },
      });
      expect(error.requestId).toBe("req_123");
      expect(error.details).toEqual({ field: "email" });
    });

    it("extends Error", () => {
      const error = new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Error",
      });
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("apiRequest", () => {
    it("makes GET request", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ data: "test" }),
      });
      global.fetch = mockFetch;

      const result = await apiRequest<{ data: string }>({
        path: "/test",
      });

      expect(result).toEqual({ data: "test" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("makes POST request with body", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ id: "123" }),
      });
      global.fetch = mockFetch;

      const result = await apiRequest<{ id: string }>({
        path: "/test",
        method: "POST",
        body: { name: "test" },
      });

      expect(result).toEqual({ id: "123" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        }),
      );
    });

    it("includes API key in headers", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({}),
      });
      global.fetch = mockFetch;

      await apiRequest({
        path: "/test",
        apiKey: "test_key",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-API-Key": "test_key",
          }),
        }),
      );
    });

    it("includes query parameters", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({}),
      });
      global.fetch = mockFetch;

      await apiRequest({
        path: "/test",
        query: { limit: 10, status: "active" },
      });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("limit=10");
      expect(callUrl).toContain("status=active");
    });

    it("skips null and undefined query params", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({}),
      });
      global.fetch = mockFetch;

      await apiRequest({
        path: "/test",
        query: { limit: 10, cursor: null, search: undefined },
      });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("limit=10");
      expect(callUrl).not.toContain("cursor");
      expect(callUrl).not.toContain("search");
    });

    it("throws ApiError on HTTP error", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            error: {
              code: "NOT_FOUND",
              message: "Resource not found",
              request_id: "req_123",
            },
          }),
      });
      global.fetch = mockFetch;

      await expect(apiRequest({ path: "/test" })).rejects.toThrow(ApiError);
      await expect(apiRequest({ path: "/test" })).rejects.toThrow(
        "Resource not found",
      );
    });

    it("throws ApiError on non-JSON error", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });
      global.fetch = mockFetch;

      await expect(apiRequest({ path: "/test" })).rejects.toThrow(ApiError);
    });

    it("handles empty response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => "",
      });
      global.fetch = mockFetch;

      const result = await apiRequest({ path: "/test" });
      expect(result).toBeNull();
    });
  });
});
