/**
 * Shared focus-visible ring recipe used across Button, Input, Dialog close,
 * and any future interactive component. Centralising this keeps the focus
 * affordance consistent — it's the chartreuse ring that defines Xplode UI's
 * identity, so every focusable element should share the exact same look.
 */
export const focusRingClasses =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";
