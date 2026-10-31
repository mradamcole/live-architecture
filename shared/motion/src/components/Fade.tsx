import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { motionPresets } from "../presets/variants";

export type FadeProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  /** Stable key when swapping content under a single Fade (e.g. tab id). */
  presenceKey?: string;
};

/**
 * Short opacity enter/exit for tab panels, overlays, and similar swaps.
 */
export function Fade({
  open,
  children,
  className,
  presenceKey = "fade",
}: FadeProps) {
  const { variants, transition } = motionPresets.fade;

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <motion.div
          key={presenceKey}
          className={className}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={transition}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
