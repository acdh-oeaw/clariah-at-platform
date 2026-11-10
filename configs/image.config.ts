/** The widths the api's image-variant endpoint accepts. It rejects any other width. */
export const imageVariantWidths = [320, 480, 640, 800, 960, 1280, 1600, 2048, 2560, 3200, 3840] as const;

/** The last rung, named so that clamping does not have to index into the tuple. */
export const maxImageVariantWidth = 3840;

/** Carries an image's source width to the loader, which only gets `src`, `width` and `quality`. */
export const sourceWidthParam = "sw";

/** The only quality locally served images are optimized at. The api's endpoint takes no quality parameter. */
export const imageQuality = 90;

/** The size of a generated PNG link preview. */
export const openGraphImageSize = { width: 1200, height: 630 };
