import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';

  if (!query) {
    return NextResponse.json({ error: 'Debes enviar un término de búsqueda.' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Falta configurar YOUTUBE_API_KEY en el servidor.' },
      { status: 500 },
    );
  }

  const url = new URL(YOUTUBE_SEARCH_ENDPOINT);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('type', 'video');
  url.searchParams.set('q', query);
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    const payload = await response.json();

    if (!response.ok) {
      const reason = payload?.error?.errors?.[0]?.reason as string | undefined;
      const message = payload?.error?.message as string | undefined;

      if (reason === 'quotaExceeded') {
        return NextResponse.json(
          { error: 'Se alcanzó la cuota de YouTube API. Intenta más tarde.' },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: message || 'No se pudo consultar YouTube en este momento.' },
        { status: response.status },
      );
    }

    const videoId = payload?.items?.[0]?.id?.videoId as string | undefined;

    if (!videoId) {
      return NextResponse.json({ error: 'No encontramos videos para ese truco.' }, { status: 404 });
    }

    return NextResponse.json({ videoId });
  } catch {
    return NextResponse.json(
      { error: 'Ocurrió un error de red consultando YouTube.' },
      { status: 502 },
    );
  }
}
