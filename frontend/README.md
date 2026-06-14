# Jakuy TV Frontend

The Jakuy TV frontend provides a responsive interface for browsing and watching public
Uzbek live TV channels.

## Features

- Browse and search Uzbek channels
- Filter channels by category
- Watch live HLS and MPEG-TS streams
- Save favorite channels
- Switch channels in fullscreen mode
- Track recently watched channels
- Load M3U playlists and optional EPG data

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- HLS.js and mpegts.js

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Jakuy TV
```

## Security

Jakuy TV does not host or own video streams. Only use playlists and streams you are
authorized to access.
