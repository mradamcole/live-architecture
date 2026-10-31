import { AnimatePresence, motion } from "motion/react";
import type { HTMLAttributes, ReactNode } from "react";
import { motionPresets } from "../presets/variants";

export type CollapseProps = {
  open: boolean;
  children: ReactNode;
  /** Passed to the animated panel (id, role, aria-*). */
  className?: string;
  id?: string;
  role?: HTMLAttributes<HTMLDivElement>["role"];
  "aria-labelledby"?: string;
};

/**
 * Height + opacity enter/exit for accordion bodies and similar panels.
 * Keeps children mounted through the exit animation via AnimatePresence.
 */
export function Collapse({
  open,
  children,
  className,
  id,
  role,
  "aria-labelledby": ariaLabelledBy,
}: CollapseProps) {
  const { variants, transition } = motionPresets.collapse;

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="collapse-panel"
          id={id}
          role={role}
          aria-labelledby={ariaLabelledBy}
          className={className}
          variants={variants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={transition}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
