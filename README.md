# patineto

App web para skaters con mini-apps (S.K.A.T.E, Dados y más).

## Stack actual

- Next.js (App Router)
- Tailwind CSS
- TypeScript

## Rutas iniciales (fase diseño)

- `/` home con selección de juego
- `/skate` placeholder del juego de S.K.A.T.E
- `/dice` placeholder del juego de dados
- `/profile` placeholder de perfil/estadísticas

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Variable de entorno requerida

Para habilitar la búsqueda automática de videos en YouTube (primer resultado), configura:

```bash
YOUTUBE_API_KEY=tu_api_key
```

En desarrollo puedes guardarla en `.env.local`. Esta clave se usa solo en el endpoint server-side `app/api/youtube/search/route.ts` y no se expone al cliente.

