import { scaleOrdinal, type ScaleOrdinal } from "d3-scale";

/** YouTrack color-coding pairs (background + matching text color), greyscale excluded. */
export interface ColorPair {
  background: string;
  foreground: string;
}

const LIGHT_TEXT_PAIRS = {
  lightGreen: { background: "#b7e281", foreground: "#444444" },
  lightTeal: { background: "#92e1d5", foreground: "#4a5050" },
  lightBlue: { background: "#a6e0fc", foreground: "#4e5357" },
  lightPink: { background: "#ffc8ea", foreground: "#5a5358" },
  yellow: { background: "#ffd74a", foreground: "#575346" },
  sand: { background: "#e0c378", foreground: "#545149" },
};

const MEDIUM_PAIRS = {
  green: { background: "#7dbd36", foreground: "#ffffff" },
  teal: { background: "#26beb2", foreground: "#fcfdfd" },
  blue: { background: "#42a3df", foreground: "#f7fbfd" },
  pink: { background: "#ff7bc3", foreground: "#fff6fa" },
  orange: { background: "#ff7022", foreground: "#fff9f5" },
  amber: { background: "#ce6700", foreground: "#fdf7f4" },
};

const DARK_PAIRS = {
  darkGreen: { background: "#3f9601", foreground: "#fffffe" },
  darkTeal: { background: "#2e9890", foreground: "#f6fafa" },
  darkBlue: { background: "#0070e4", foreground: "#f4f9fd" },
  magenta: { background: "#dc0183", foreground: "#fef4f9" },
  red: { background: "#e30000", foreground: "#fef5f5" },
  brown: { background: "#8d5100", foreground: "#faf7f4" },
};

const { lightGreen, lightTeal, lightBlue, lightPink, yellow, sand } = LIGHT_TEXT_PAIRS;
const { green, teal, blue, pink, orange, amber } = MEDIUM_PAIRS;
const { darkGreen, darkTeal, darkBlue, magenta, red, brown } = DARK_PAIRS;

/**
 * Ordered so that colors assigned next to each other differ strongly:
 * hues jump around the color wheel and lightness alternates, so the first
 * handful of categories (the most common case) are maximally distinct and
 * similar hues (e.g. the three greens or teals) are far apart in the sequence.
 */
export const CATEGORICAL_PAIRS: ColorPair[] = [
  darkBlue,
  orange,
  darkGreen,
  pink,
  red,
  teal,
  yellow,
  brown,
  lightBlue,
  magenta,
  lightGreen,
  amber,
  darkTeal,
  sand,
  blue,
  lightPink,
  green,
  lightTeal,
];

const foregroundByBackground = new Map(CATEGORICAL_PAIRS.map((p) => [p.background, p.foreground]));

/** d3 ordinal scale: category key (e.g. author id) -> background color. Wraps around when exhausted. */
export const createCategoricalColorScale = (domain: string[]): ScaleOrdinal<string, string> =>
  scaleOrdinal<string, string>(CATEGORICAL_PAIRS.map((p) => p.background)).domain(domain);

/** Text color that goes with a background returned by the scale. */
export const foregroundFor = (background: string): string =>
  foregroundByBackground.get(background) ?? "#ffffff";
