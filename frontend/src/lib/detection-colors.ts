/**
 * Detection color palette for object detection overlays
 * These colors are chosen to be distinctly visible and colorblind-friendly
 */
export const DETECTION_COLORS: string[] = [
  "rgb(255, 107, 107)",  // Red
  "rgb(78, 205, 196)",   // Teal
  "rgb(69, 183, 209)",   // Cyan
  "rgb(255, 160, 122)",  // Salmon
  "rgb(152, 216, 200)",  // Mint
  "rgb(247, 220, 111)",  // Yellow
  "rgb(187, 143, 206)",  // Purple
  "rgb(133, 193, 226)",  // Sky Blue
];

/**
 * Get a color from the palette for a given object index
 * Cycles through the palette if index exceeds array length
 *
 * @param index - The index of the detected object
 * @returns RGB color string for use in styling
 *
 * Reason: Using modulo ensures we always have a valid color regardless
 * of how many objects are detected, cycling through the palette repeatedly
 */
export function getDetectionColor(index: number): string {
  return DETECTION_COLORS[index % DETECTION_COLORS.length];
}
