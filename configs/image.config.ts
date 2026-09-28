/**
 * The widths the api's image-variant endpoint will render, mirroring `imageVariantWidths` in its own `api.config.ts`.
 *
 * The endpoint rejects any width not on this list, so the list also has to be the ladder `next/image` draws its
 * `srcset` candidates from — which is why `images.deviceSizes` and `images.imageSizes` in `next.config.ts` are derived
 * from it rather than left at their defaults, of whose rungs the endpoint would accept only 640, 2048 and 3840.
 */
export const imageVariantWidths = [320, 480, 640, 960, 1280, 1600, 2048, 2560, 3200, 3840] as const;

/** The last rung, named so that clamping does not have to index into the tuple. */
export const maxImageVariantWidth = 3840;

/**
 * Query parameter carrying an image's source width through to the loader.
 *
 * A `next/image` loader is handed only `src`, `width` and `quality`, so anything else it needs in order to decide has
 * to ride along inside the `src`. Stripped again before the url is emitted.
 */
export const sourceWidthParam = "sw";

/**
 * The one quality the built-in optimizer is configured to serve (`images.qualities`).
 *
 * A single-entry list is what pins it: next clamps whatever quality an image asks for onto the nearest configured rung,
 * so every rendition comes back at this one and no call site has to say so. Applies to locally served images only — the
 * variant endpoint takes no quality parameter, and imgproxy decides for itself.
 */
export const imageQuality = 90;
