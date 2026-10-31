import type { Transition, Variants } from "motion/react";

/** Durations in seconds — keep in sync with tokens.css. */
export const motionDurations = {
  fast: 0.12,
  md: 0.22,
  slow: 0.32,
} as const;

export const motionEasings = {
  standard: [0.2, 0, 0, 1] as const,
  emphasized: [0.3, 0, 0, 1] as const,
};

export const motionTransitions = {
  fast: {
    duration: motionDurations.fast,
    ease: motionEasings.standard,
  } satisfies Transition,
  md: {
    duration: motionDurations.md,
    ease: motionEasings.standard,
  } satisfies Transition,
  slow: {
    duration: motionDurations.slow,
    ease: motionEasings.emphasized,
  } satisfies Transition,
} as const;

export const collapseVariants = {
  open: {
    height: "auto",
    opacity: 1,
  },
  closed: {
    height: 0,
    opacity: 0,
  },
} satisfies Variants;

export const fadeVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
} satisfies Variants;

export const pressVariants = {
  rest: { scale: 1 },
  pressed: { scale: 0.97 },
} satisfies Variants;

export const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 90 },
} satisfies Variants;

export const motionPresets = {
  collapse: {
    variants: collapseVariants,
    transition: motionTransitions.md,
  },
  fade: {
    variants: fadeVariants,
    transition: motionTransitions.fast,
  },
  press: {
    variants: pressVariants,
    transition: motionTransitions.fast,
  },
  chevron: {
    variants: chevronVariants,
    transition: motionTransitions.fast,
  },
} as const;
