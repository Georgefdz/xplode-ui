import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { Toaster, toast } from "./Toaster";

// Sonner reads window.matchMedia on mount; jsdom doesn't implement it.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
});

describe("Toaster", () => {
  it("renders the toast region without crashing", () => {
    render(<Toaster />);
    expect(document.querySelector("section[aria-live]")).toBeTruthy();
  });

  it("re-exports the sonner toast function", () => {
    expect(typeof toast).toBe("function");
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
  });
});
