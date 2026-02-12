'use client';

import { useMemo } from 'react';

import { buildYoutubeSearchUrl } from '@/lib/youtube';

export function useYoutubeSearchUrl(query: string) {
  return useMemo(() => buildYoutubeSearchUrl(query), [query]);
}
