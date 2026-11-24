import { scaleOrdinal, type ScaleOrdinal } from "d3-scale";

/** A YouTrack color-coding pair (background + matching text color). */
export interface ColorPair {
  background: string;
  foreground: string;
}

// YouTrack's color-coding palette (index 0, "no color", is omitted).
// Source: YouTrack documentation, "Color Indices" table.
// Named after YouTrack's CSS variables, e.g. --color-id-9-foreground / --color-id-9-background
const colorId1Foreground = "#ffffff";
const colorId1Background = "#8d5100";
const colorId2Foreground = "#ffffff";
const colorId2Background = "#ce6700";
const colorId3Foreground = "#ffffff";
const colorId3Background = "#409600";
const colorId4Foreground = "#ffffff";
const colorId4Background = "#0070e4";
const colorId5Foreground = "#ffffff";
const colorId5Background = "#900052";
const colorId6Foreground = "#ffffff";
const colorId6Background = "#0050a1";
const colorId7Foreground = "#ffffff";
const colorId7Background = "#2f9890";
const colorId8Foreground = "#ffffff";
const colorId8Background = "#8e1600";
const colorId9Foreground = "#ffffff";
const colorId9Background = "#dc0083";
const colorId10Foreground = "#ffffff";
const colorId10Background = "#7dbd36";
const colorId11Foreground = "#ffffff";
const colorId11Background = "#ff7123";
const colorId12Foreground = "#ffffff";
const colorId12Background = "#ff7bc3";
const colorId13Foreground = "#444444";
const colorId13Background = "#fed74a";
const colorId14Foreground = "#444444";
const colorId14Background = "#b7e281";
const colorId15Foreground = "#45818e";
const colorId15Background = "#d8f7f3";
const colorId16Foreground = "#888888";
const colorId16Background = "#e6e6e6";
const colorId17Foreground = "#4da400";
const colorId17Background = "#e6f6cf";
const colorId18Foreground = "#b45f06";
const colorId18Background = "#ffee9c";
const colorId19Foreground = "#444444";
const colorId19Background = "#ffc8ea";
const colorId20Foreground = "#ffffff";
const colorId20Background = "#e30000";
const colorId21Foreground = "#3d85c6";
const colorId21Background = "#e0f1fb";
const colorId22Foreground = "#dc5766";
const colorId22Background = "#fce5f1";
const colorId23Foreground = "#b45f06";
const colorId23Background = "#f7e9c1";
const colorId24Foreground = "#444444";
const colorId24Background = "#92e1d5";
const colorId25Foreground = "#444444";
const colorId25Background = "#a6e0fc";
const colorId26Foreground = "#444444";
const colorId26Background = "#e0c378";
const colorId27Foreground = "#444444";
const colorId27Background = "#bababa";
const colorId28Foreground = "#ffffff";
const colorId28Background = "#25beb2";
const colorId29Foreground = "#ffffff";
const colorId29Background = "#42a3df";
const colorId30Foreground = "#ffffff";
const colorId30Background = "#878787";
const colorId31Foreground = "#ffffff";
const colorId31Background = "#4d4d4d";
const colorId32Foreground = "#ffffff";
const colorId32Background = "#246512";
const colorId33Foreground = "#ffffff";
const colorId33Background = "#00665e";
const colorId34Foreground = "#ffffff";
const colorId34Background = "#553000";
const colorId35Foreground = "#ffffff";
const colorId35Background = "#1a1a1a";

/** All palette pairs, keyed by color index. */
export const YOUTRACK_COLORS: Readonly<Record<number, ColorPair>> = {
  1: { foreground: colorId1Foreground, background: colorId1Background },
  2: { foreground: colorId2Foreground, background: colorId2Background },
  3: { foreground: colorId3Foreground, background: colorId3Background },
  4: { foreground: colorId4Foreground, background: colorId4Background },
  5: { foreground: colorId5Foreground, background: colorId5Background },
  6: { foreground: colorId6Foreground, background: colorId6Background },
  7: { foreground: colorId7Foreground, background: colorId7Background },
  8: { foreground: colorId8Foreground, background: colorId8Background },
  9: { foreground: colorId9Foreground, background: colorId9Background },
  10: { foreground: colorId10Foreground, background: colorId10Background },
  11: { foreground: colorId11Foreground, background: colorId11Background },
  12: { foreground: colorId12Foreground, background: colorId12Background },
  13: { foreground: colorId13Foreground, background: colorId13Background },
  14: { foreground: colorId14Foreground, background: colorId14Background },
  15: { foreground: colorId15Foreground, background: colorId15Background },
  16: { foreground: colorId16Foreground, background: colorId16Background },
  17: { foreground: colorId17Foreground, background: colorId17Background },
  18: { foreground: colorId18Foreground, background: colorId18Background },
  19: { foreground: colorId19Foreground, background: colorId19Background },
  20: { foreground: colorId20Foreground, background: colorId20Background },
  21: { foreground: colorId21Foreground, background: colorId21Background },
  22: { foreground: colorId22Foreground, background: colorId22Background },
  23: { foreground: colorId23Foreground, background: colorId23Background },
  24: { foreground: colorId24Foreground, background: colorId24Background },
  25: { foreground: colorId25Foreground, background: colorId25Background },
  26: { foreground: colorId26Foreground, background: colorId26Background },
  27: { foreground: colorId27Foreground, background: colorId27Background },
  28: { foreground: colorId28Foreground, background: colorId28Background },
  29: { foreground: colorId29Foreground, background: colorId29Background },
  30: { foreground: colorId30Foreground, background: colorId30Background },
  31: { foreground: colorId31Foreground, background: colorId31Background },
  32: { foreground: colorId32Foreground, background: colorId32Background },
  33: { foreground: colorId33Foreground, background: colorId33Background },
  34: { foreground: colorId34Foreground, background: colorId34Background },
  35: { foreground: colorId35Foreground, background: colorId35Background },
};

/**
 * Color indices used for categories, in assignment order. Greyscale (16, 27, 30, 31, 35) and the
 * pale tinted pairs (15, 17, 18, 21, 22, 23) are left out: they are too close to the background
 * or to each other to tell segments apart.
 *
 * Ordered so that colors assigned next to each other differ strongly: hues jump around the color
 * wheel and lightness alternates, so the first handful of categories (the most common case) are
 * maximally distinct and similar hues (e.g. the greens or teals) are far apart in the sequence.
 */
const CATEGORICAL_INDICES = [
  4, // blue
  11, // orange
  3, // green
  12, // pink
  20, // red
  28, // teal
  13, // yellow
  1, // brown
  25, // light blue
  9, // magenta
  14, // light green
  2, // amber
  7, // dark teal
  26, // sand
  29, // sky blue
  19, // light pink
  10, // lime
  24, // light teal
  6, // navy
  8, // dark red
  32, // forest green
  5, // plum
  33, // deep teal
  34, // dark brown
];

export const CATEGORICAL_PAIRS: ColorPair[] = CATEGORICAL_INDICES.map((i) => YOUTRACK_COLORS[i]);

const foregroundByBackground = new Map(
  Object.values(YOUTRACK_COLORS).map((p) => [p.background, p.foreground]),
);

/**
 * d3 ordinal scale: category key (e.g. author id) -> background color, using the YouTrack colors
 * at the given color indices in order. Wraps around when exhausted.
 */
export const createColorScaleFromIndices = (
  indices: readonly number[],
  domain: string[],
): ScaleOrdinal<string, string> => {
  const backgrounds = indices.map((i) => {
    const pair = YOUTRACK_COLORS[i];
    if (!pair) throw new RangeError(`Unknown YouTrack color index: ${i}`);
    return pair.background;
  });
  return scaleOrdinal<string, string>(backgrounds).domain(domain);
};

/**
 * Indices approximating the palette of the portrait image: near-black background, navy and
 * saturated blue clothing, magenta and red shading, pink and salmon highlights, pale pink skin.
 * Ordered dark to light.
 */
export const PORTRAIT_INDICES = [
  4, // blue
  19, // pale pink
  9, // magenta
  11, // orange
  12, // pink
  20, // red
];

/** Scale resembling the portrait image's colors. */
export const createPortraitColorScale = (domain: string[]): ScaleOrdinal<string, string> =>
  createColorScaleFromIndices(PORTRAIT_INDICES, domain);

/** Categorical scale using the default, well-spread color order. */
export const createCategoricalColorScale = (domain: string[]): ScaleOrdinal<string, string> =>
  createColorScaleFromIndices(CATEGORICAL_INDICES, domain);

/** Text color that goes with a background returned by the scale. */
export const foregroundFor = (background: string): string =>
  foregroundByBackground.get(background) ?? "#ffffff";
