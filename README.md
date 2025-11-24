# FilmMuse

A modern film discovery platform that helps users find the perfect film for their mood through personalized recommendations and curated lists.

## Features

- **Personalized Recommendations**: AI-powered movie recommendations based on your watchlist and preferences
- **Watchlist Management**: Add, remove, and organize movies in personal watchlists
- **Custom Lists**: Create and share custom movie lists with other users
- **User Following**: Follow other users and discover their curated lists
- **Fast Search**: Optimized search with autocomplete, genre filtering, and recent searches
- **Movie Details**: Comprehensive movie information from TMDb API (with OMDb fallback)
- **Movie Ratings**: Rate and review movies you've watched
- **Theme Support**: Light, dark, and system theme preferences with smooth transitions
- **Enhanced UI**: Stagger animations, micro-interactions, breadcrumbs, and improved loading states

## Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Movie Data**: TMDb API (primary), OMDb API (fallback)
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Theme System**: Custom theme provider with light/dark mode support

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase project
- TMDb API key (get one at [themoviedb.org](https://www.themoviedb.org))

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   
   # TMDb API Key
   TMDB_API_KEY=your-tmdb-api-key
   
   # OMDb API Key (optional, used as fallback)
   OMDB_API_KEY=your-omdb-api-key
   ```
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/             # Utilities, services, and helpers
│   ├── firebase/    # Firebase configuration and services
│   ├── tmdb.ts      # TMDb API service
│   └── omdb.ts      # OMDb API service (fallback)
├── services/        # Service layer for external APIs
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run analyze` - Analyze bundle size

## API Integration

### TMDb API
- Primary source for movie details and posters
- Requires API key from [themoviedb.org](https://www.themoviedb.org)
- Attribution displayed in footer per TMDb requirements

### OMDb API
- Fallback source when TMDb is unavailable
- Optional but recommended for better coverage

## Performance & Optimization

- Server Components where possible
- Lazy loading for non-critical components
- Image optimization with Next.js Image component
- Bundle size optimization
- Code splitting and dynamic imports
- Font optimization

## Security

- Security headers (CSP, HSTS, XSS protection)
- API input validation with Zod
- Firebase Admin SDK for server-side operations
- Environment variable management
- No hardcoded secrets

## Testing

- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- CI pipeline with GitHub Actions

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Private - All rights reserved
