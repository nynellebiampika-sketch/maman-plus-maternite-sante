/**
 * MAMAN+ YouTube Thumbnail Resolution & Fallback Utility
 * 
 * Provides robust resolution of YouTube thumbnails with strict fallback priority:
 * 1. API snippet.thumbnails.maxres.url
 * 2. API snippet.thumbnails.high.url
 * 3. API snippet.thumbnails.medium.url
 * 4. API snippet.thumbnails.default.url
 * 
 * And network fallback chain per video ID:
 * maxresdefault -> hqdefault -> mqdefault -> default
 */

export interface YouTubeSnippetThumbnails {
  maxres?: { url: string; width?: number; height?: number };
  high?: { url: string; width?: number; height?: number };
  medium?: { url: string; width?: number; height?: number };
  default?: { url: string; width?: number; height?: number };
}

/**
 * Extracts the best available thumbnail URL from YouTube Data API v3 snippet
 */
export function getBestYouTubeThumbnailUrl(
  thumbnails?: YouTubeSnippetThumbnails,
  videoId?: string
): string {
  if (thumbnails) {
    if (thumbnails.maxres?.url) return thumbnails.maxres.url;
    if (thumbnails.high?.url) return thumbnails.high.url;
    if (thumbnails.medium?.url) return thumbnails.medium.url;
    if (thumbnails.default?.url) return thumbnails.default.url;
  }
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
}

/**
 * Generates an ordered list of thumbnail candidates for fallback
 */
export function getThumbnailCandidates(
  initialUrl?: string,
  videoId?: string
): string[] {
  const candidates: string[] = [];

  if (initialUrl && initialUrl.trim()) {
    candidates.push(initialUrl.trim());
  }

  if (videoId && videoId.trim()) {
    const cleanId = videoId.trim();
    const standardCandidates = [
      `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${cleanId}/mqdefault.jpg`,
      `https://i.ytimg.com/vi/${cleanId}/default.jpg`,
      `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`,
    ];

    for (const c of standardCandidates) {
      if (!candidates.includes(c)) {
        candidates.push(c);
      }
    }
  }

  return candidates;
}
