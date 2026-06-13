import { describe, it, expect, vi, beforeAll } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";
import { useIsMobile } from "./useIsMobile";

// jsdom does not implement matchMedia. Stub it so the hooks can subscribe;
// `matches` is driven by the query string for deterministic assertions.
beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    // Pretend the viewport is narrow: max-width queries match, min-width don't.
    matches: query.includes("max-width"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("useMediaQuery", () => {
  it("reflects the matchMedia result for the given query", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 600px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when the query does not match", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 1280px)"));
    expect(result.current).toBe(false);
  });
});

describe("useIsMobile", () => {
  it("is true when the viewport is below the breakpoint", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
