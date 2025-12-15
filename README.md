# FilmMuse

A modern film discovery platform that helps users find the perfect film for their mood through personalized recommendations and curated lists.

## Features

- **Personalized Recommendations**: Algorithm-based movie recommendations using genre matching and scoring based on your watchlist and preferences
- **Watchlist Management**: Add, remove, and organize movies in personal watchlists
- **Liked Movies**: Save movies you love for quick access
- **Custom Lists**: Create, edit, and share custom movie lists with other users (public or private)
- **Friends System**: Send friend requests, accept/reject requests, and manage friendships
- **User Following**: Follow other users and discover their curated lists (separate from friends)
- **Movie Discovery**: Browse trending, popular, now-playing, and upcoming movies with genre/year/rating filters
- **Fast Search**: Optimized search with autocomplete, genre filtering, and fuzzy matching
- **Comprehensive Movie Details**: 
  - Movie information (plot, cast, crew, ratings, awards)
  - Watch providers (streaming, rent, buy)
  - Trailers and videos
  - Reviews and ratings
  - Similar movies and recommendations
  - Movie collections
  - Keywords and tags
- **Movie Ratings**: Rate movies 1-5 stars and track your ratings
- **Account Management**: Update username and manage profile settings
- **Theme Support**: Light, dark, and system theme preferences with smooth transitions
- **Enhanced UI**: Stagger animations, micro-interactions, breadcrumbs, haptic feedback, and improved loading states
- **Error Tracking**: Sentry integration for error monitoring
- **Toast Notifications**: User-friendly notifications for actions and errors

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
- **Error Tracking**: Sentry
- **Notifications**: React Hot Toast
- **Validation**: Zod
- **Search**: Fuse.js for fuzzy search

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase project
- TMDb API key (get one at [themoviedb.org](https://www.themoviedb.org))

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `env.template` to `.env` and fill in your credentials:
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
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API routes (friends, movies, recommendations, etc.)
│   ├── discover/          # Movie discovery page with filters
│   ├── search/            # Search page
│   ├── profile/           # User profile page
│   ├── account/            # Account settings page
│   └── [auth pages]/      # Login, signup, logout
├── components/             # React components
│   ├── friends/           # Friend management components
│   ├── home/              # Homepage components
│   ├── movie-details/     # Movie detail sections
│   ├── profile/           # Profile page components
│   ├── search/            # Search components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities, services, and helpers
│   ├── firebase/          # Firebase configuration and services
│   │   ├── auth.ts        # Authentication
│   │   ├── firestore.ts   # Firestore operations
│   │   ├── friends.ts     # Friends system
│   │   └── follows.ts     # Following system
│   ├── tmdb.ts            # TMDb API service
│   ├── omdb.ts            # OMDb API service (fallback)
│   ├── validation.ts      # Zod schemas
│   └── error-handler.ts   # Error tracking (Sentry)
├── services/              # Service layer for external APIs
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── data/                  # Static data (movie index, cache)
```

## Scripts

- `npm run dev` – Start the development server (Turbopack)
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run lint` – Run ESLint
- `npm run typecheck` – Run TypeScript type checking
- `npm run test` – Run unit tests (Jest)
- `npm run test:e2e` – Run Playwright E2E tests
- `npm run analyze` – Build with bundle analyzer enabled
- `npm run build:movies` – Convert TMDb CSV into JSONL
- `npm run build:index` – Build the movie search index

## API Integration

### TMDb API
- Primary source for movie details, posters, cast, crew, videos, and reviews
- Discover movies with filters (genre, year, rating, language)
- Get trending, popular, now-playing, and upcoming movies
- Fetch similar movies and recommendations
- Requires API key from [themoviedb.org](https://www.themoviedb.org)
- Attribution displayed in footer per TMDb requirements

### OMDb API
- Fallback source when TMDb is unavailable
- Provides additional movie metadata (IMDb ratings, awards)
- Optional but recommended for better coverage

### Firebase
- **Firestore**: Stores user data (watchlists, lists, ratings, friends, follows)
- **Auth**: Handles user authentication (email/password, Google sign-in)
- **Admin SDK**: Server-side operations for friends and lists management

## Performance & Optimization

- Server Components where possible
- Lazy loading for non-critical components
- Image optimization with Next.js Image component
- Bundle size optimization
- Code splitting and dynamic imports
- Font optimization

## Security

- Security headers (CSP, HSTS, XSS protection, X-Frame-Options, Referrer-Policy)
- API input validation with Zod schemas
- Firebase Admin SDK for server-side operations
- Token-based authentication for API routes
- Environment variable management
- No hardcoded secrets
- Server-side authorization checks

## Additional Features

- **Haptic Feedback**: Tactile feedback for movie interaction actions (watchlist, likes, ratings) on mobile devices
- **Error Boundaries**: Graceful error handling with React error boundaries
- **Loading States**: Skeleton loaders and progress indicators
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **SEO**: Dynamic sitemap, robots.txt, and metadata

## Testing

- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright for end-to-end testing
- **Test Scripts**: 
  - `npm run test` - Run unit tests
  - `npm run test:watch` - Run tests in watch mode
  - `npm run test:e2e` - Run Playwright E2E tests

## License

Private - All rights reserved
