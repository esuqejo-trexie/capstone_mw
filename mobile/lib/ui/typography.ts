import { Dimensions } from "react-native";

/**
 * We base font scaling on screen height because:
 * - SmartRead is landscape-first
 * - Height is more stable across tablets & phones
 */
const { height } = Dimensions.get("window");

/**
 * Responsive font helper
 * @param min - minimum font size
 * @param max - maximum font size
 * @param factor - scaling factor (tweak globally if needed)
 */
export function rf(min: number, max: number, factor = 0.035): number {
  const size = height * factor;
  return Math.max(min, Math.min(size, max));
}

/**
 * Standardized typography roles
 * Use these instead of hardcoded font sizes.
 */
export const typography = {
  /** Big section titles (e.g. Level headers, screen titles) */
  header: rf(18, 28),

  /** Main story / reading text */
  story: rf(20, 36),

  /** Regular body text */
  body: rf(16, 22),

  /** Button labels */
  button: rf(14, 22),

  /** Small helper / caption text */
  caption: rf(12, 16),
};
