import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export type MotionProviderProps = {
  children: ReactNode;
};

/**
 * App-shell wrapper. Honors the user's `prefers-reduced-motion` setting for
 * all Motion-driven animations under this tree.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  );
}
