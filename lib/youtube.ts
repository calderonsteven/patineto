export function buildYoutubeSearchUrl(query: string) {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) {
    return '';
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanedQuery)}`;
}
