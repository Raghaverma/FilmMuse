# FilmMuse

A modern film discovery platform that helps users find the perfect film for their mood through personalized recommendations and curated lists.

## Features

- **Personalized Recommendations**: AI-powered movie recommendations based on your watchlist and preferences
- **Watchlist Management**: Add, remove, and organize movies in personal watchlists
- **Custom Lists**: Create and share custom movie lists with other users
- **User Following**: Follow other users and discover their curated lists
- **Fast Search**: Optimized search with autocomplete, genre filtering, and recent searches
- **Movie Details**: Comprehensive movie information from TMDb API (with OMDb fallback)
- **Movie Ratings**: Rate and review movies you've watched (1-5 stars)
- **Authentication**: Email/Password and Google Sign-In support with profile picture sync
- **Theme Support**: Light, dark, and system theme preferences with smooth transitions
- **Enhanced UI**: Stagger animations, micro-interactions, breadcrumbs, and improved loading states
- **Interactive Movie Cards**: Hover to see quick info, genres, and plot summaries

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

1. Clone the repository:
   ```bash
   git clone https://github.com/Raghaverma/FilmMuse.git
   cd FilmMuse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password and Google Sign-In
   - Create a Web app and get your Firebase config
   - Enable Firestore Database

4. Set up environment variables:
   - Copy `env.template` to `.env.local`
   - Fill in your credentials:
   ```bash
   # Firebase Configuration (from Firebase Console > Project Settings > Your apps)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # TMDb API Key (get one at https://www.themoviedb.org)
   TMDB_API_KEY=your_tmdb_api_key
   
   # OMDb API Key (optional, used as fallback - get one at https://www.omdbapi.com)
   OMDB_API_KEY=your_omdb_api_key
   
   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

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
- Primary source for movie details, posters, and backdrops
- Requires API key from [themoviedb.org](https://www.themoviedb.org)
- Attribution displayed in footer per TMDb requirements
- Provides movie metadata, cast, crew, and ratings

### OMDb API
- Fallback source when TMDb is unavailable
- Provides actual IMDb ratings and additional metadata
- Optional but recommended for better coverage and accurate IMDb ratings
- Automatically fetches IMDb ratings when TMDb data includes an IMDb ID

### Firebase
- **Authentication**: Email/Password and Google Sign-In
- **Firestore**: User profiles, watchlists, ratings, and custom lists
- **Storage**: User profile pictures (synced from Google accounts)

## Performance & Optimization

- Server Components where possible
- Lazy loading for non-critical components
- Image optimization with Next.js Image component
- Bundle size optimization
- Code splitting and dynamic imports
- Font optimization

## Security

- **Content Security Policy (CSP)**: Configured to allow Firebase and Google OAuth scripts
- **Security Headers**: HSTS, XSS protection, frame options, and more
- **API Input Validation**: Zod schema validation for all API endpoints
- **Firebase Admin SDK**: Server-side operations with secure token verification
- **Environment Variables**: All secrets stored in `.env.local` (never committed)
- **Authorized Domains**: Firebase authentication configured for localhost and production domains

## Testing

- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- CI pipeline with GitHub Actions

## Recent Updates

### Authentication & User Experience
- ✅ Added Google Sign-In support with profile picture synchronization
- ✅ Fixed movie card hover interactions (3-dots menu now accessible)
- ✅ Improved error handling with user-friendly messages
- ✅ Enhanced Content Security Policy for Google OAuth

### Movie Data & Ratings
- ✅ Fixed IMDb rating display (removed incorrect division)
- ✅ Automatic IMDb rating fetching from OMDb when available
- ✅ Improved movie detail modal with better error handling

### Bug Fixes
- ✅ Fixed Firebase rating error when `movieYear` is undefined
- ✅ Improved z-index layering for interactive elements
- ✅ Better handling of optional fields in Firestore

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Private - All rights reserved
