import { useMediaQuery } from "./useMediaQuery";

/** Default viewport width (px) below which the UI is considered "mobile". */
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}
