/**
 * Utility functions for resolving image URLs
 * Images are hosted on apiserver.kokbooks.in, not apiserver.kokbooks.com
 */

const IMAGE_BASE = "https://apiserver.kokbooks.in";

/**
 * Resolve an image URL from either a full URL or a relative path
 * @param image - Full image URL (if available)
 * @param imagePath - Relative image path (if available)
 * @returns Resolved image URL or null if no image data
 */
export function resolveImageUrl(image: string | null | undefined, imagePath: string | null | undefined): string | null {
  // If image already has full URL, use it
  if (image) return image;
  
  // If we have imagePath, construct URL with correct image domain
  if (imagePath) {
    // Remove any leading slash from imagePath
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${IMAGE_BASE}/${cleanPath}`;
  }
  
  return null;
}

/**
 * Resolve banner image URL (wrapper for resolveImageUrl)
 */
export function resolveBannerImage(image: string | null, imagePath: string | null): string | null {
  return resolveImageUrl(image, imagePath);
}

/**
 * Resolve book cover image URL (wrapper for resolveImageUrl)
 */
export function resolveBookCoverImage(image: string | null, imagePath: string | null): string | null {
  return resolveImageUrl(image, imagePath);
}

/**
 * Resolve blog cover image URL (wrapper for resolveImageUrl)
 */
export function resolveBlogCoverImage(image: string | null, imagePath: string | null): string | null {
  return resolveImageUrl(image, imagePath);
}