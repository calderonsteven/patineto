export function buildYoutubeSearchUrl(query: string) {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) {
    return '';
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanedQuery)}`;
}

export function extractYoutubeVideoId(input: string) {
  const cleanedInput = input.trim();

  if (!cleanedInput) {
    return '';
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(cleanedInput);
  } catch {
    return '';
  }

  const host = parsedUrl.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const videoId = parsedUrl.searchParams.get('v')?.trim() ?? '';

    return videoId;
  }

  if (host === 'youtu.be') {
    const [videoId] = parsedUrl.pathname.split('/').filter(Boolean);

    return videoId ?? '';
  }

  return '';
}
