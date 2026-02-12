# Patineto

Patineto es una web app para skaters con mini-apps por módulo (S.K.A.T.E, dados y experimentos de Labs), construida con Next.js App Router.

## Qué incluye hoy

- Home con cards de navegación por módulo.
- Módulo **S.K.A.T.E** con búsqueda de tutoriales en YouTube por nombre de truco y embed del primer resultado.
- Módulo **Dados** con selección de dificultad, animación de tirada y generación de reto (postura + obstáculo opcional + truco).
- Módulo **Labs · Trick Checklist** para marcar estado de trucos y validar flujo visual de evidencia en video.
- Módulo **Perfil y estadísticas** como placeholder para futuras métricas.
- Estilo visual consistente con Tailwind y componentes reutilizables.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Route Handlers de Next.js para API server-side
- Vercel Analytics

## Rutas y páginas

### `/` Home
Pantalla principal con presentación de Patineto y acceso a todos los módulos.

### `/skate` Juego de S.K.A.T.E
- Input para buscar truco.
- Consulta automática al endpoint interno `/api/youtube/search`.
- Render del primer video sugerido de YouTube en un `iframe`.
- Manejo de estados de carga y error (falta de API key, cuota, sin resultados, error de red).

### `/dice` Juego de Dados
- Selector de dificultad: principiante, intermedio, avanzado.
- Banco de trucos dinámico según dificultad.
- Opción para incluir o excluir obstáculo en la tirada.
- Animación con parámetros dinámicos para la tirada.
- Resultado final con resumen de reto generado.

### `/labs` Labs · Trick Checklist (nuevo)
- Lista de trucos con preview visual temporal.
- Estados por truco:
  - Lo quiero
  - Lo estoy practicando
  - Lo tengo
- Selección en memoria (sin persistencia ni backend).
- Botones de flujo UX para “Subir video” y “Grabar video” como siguiente iteración.

### `/profile` Perfil
Página placeholder para próximas funciones de progreso, historial y estadísticas.

### `/api/youtube/search`
Endpoint server-side que:
- recibe `query`
- busca en YouTube Data API v3
- devuelve `videoId` del primer resultado
- controla errores de validación, cuota y red.

## Variables de entorno

Para habilitar la búsqueda de videos en S.K.A.T.E:

```bash
YOUTUBE_API_KEY=tu_api_key
```

Guárdala en `.env.local` durante desarrollo.

> Esta clave se usa en el servidor (Route Handler) y no se expone al cliente.

## Desarrollo local

```bash
npm install
npm run dev
```

App disponible en `http://localhost:3000`.

## Scripts

```bash
npm run dev     # entorno de desarrollo
npm run build   # build de producción
npm run start   # correr build
npm run lint    # lint con Next.js
```

## Estructura del proyecto

```text
app/
  page.tsx
  skate/page.tsx
  dice/page.tsx
  labs/page.tsx
  profile/page.tsx
  api/youtube/search/route.ts
components/
  game-card.tsx
  dice/*
  youtube/trick-video.tsx
features/
  dice/config.ts
  dice/types.ts
  dice/utils.ts
hooks/
  use-dice-roller.ts
  use-youtube-search-url.ts
lib/
  youtube.ts
docs/
  stack-decision.md
```

## Estado del proyecto

Patineto está en fase beta de producto: ya hay módulos funcionales para validar experiencia, interfaz y flujo de juego; la persistencia de datos, autenticación, stats avanzados y modo competitivo están planificados para próximas fases.
