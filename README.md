# FilmMuse 🎬

A modern, intelligent movie discovery platform that learns your preferences and curates personalized recommendations. Built with Next.js, TypeScript, and Tailwind CSS.

![FilmMuse](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Personalized Recommendations
- **Smart Recommendations**: Get movie suggestions based on your watchlist and liked movies
- **Genre-based Matching**: Discover films similar to your preferences
- **Random Discoveries**: Explore random recommendations from our curated collection

### 🔍 Advanced Search
- **Fast Search**: Optimized search with intelligent caching to prevent repeated API calls
- **Genre Filtering**: Filter movies by genre (Action, Drama, Sci-Fi, etc.)
- **Debounced Input**: Smooth search experience with automatic debouncing
- **Grid & List Views**: Toggle between grid and list view for browsing

### 🎨 Interactive Movie Cards
- **Clickable Cards**: Click any movie card to view detailed information
- **Movie Details Modal**: Comprehensive movie information including:
  - Plot summary
  - Cast & crew
  - Ratings (IMDb, Metascore)
  - Runtime, release date, and more
- **Watchlist Management**: Add movies to watchlist or mark as liked
- **Custom Lists**: Create and manage custom movie lists
- **Rating System**: Rate movies with a 5-star system

### 👤 User Profiles
- **Personal Dashboard**: Track your watchlist, liked movies, and ratings
- **Activity History**: View your movie-related activities
- **Custom Lists**: Create and manage personalized movie collections

### 🎭 Beautiful UI/UX
- **Dark Theme**: Modern dark interface with emerald accents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Polished animations using Framer Motion
- **Loading States**: Elegant loading skeletons and states

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, pnpm, or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Raghaverma/FilmMuse.git
   cd FilmMuse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your OMDb API key (optional, for movie details):
   ```env
   OMDB_API_KEY=your_api_key_here
   ```

4. **Prepare data** (if needed)
   ```bash
   # Generate movies index from CSV
   npm run build:movies
   npm run build:index
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
FilmMuse/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── movie/         # Movie-related endpoints
│   │   │   ├── recommendations/  # Recommendation endpoints
│   │   │   ├── search/        # Search endpoint
│   │   │   └── poster/        # Poster fetching
│   │   ├── page.tsx           # Landing page with recommendations
│   │   ├── search/            # Search page
│   │   └── profile/           # User profile page
│   ├── components/            # React components
│   │   ├── MovieCard.tsx      # Movie card component
│   │   ├── MovieDetailsModal.tsx  # Movie details modal
│   │   └── ui/                # UI components (shadcn/ui)
│   ├── lib/                   # Utility libraries
│   │   ├── auth-client.ts     # Authentication & user data
│   │   └── omdb.ts            # OMDb API integration
│   └── data/                  # Data files
│       ├── movies.index.json  # Processed movie index
│       └── credits.csv        # Raw movie data
├── public/                    # Static assets
├── scripts/                   # Build scripts
└── data/                      # Data source files
```

## 🔌 API Endpoints

### Search
- `GET /api/search?q={query}&genre={genre}&limit={limit}&offset={offset}`
  - Search movies by title, mood, or vibe
  - Filter by genre
  - Supports pagination

### Recommendations
- `POST /api/recommendations`
  - Get personalized recommendations based on watchlist and liked movies
  - Body: `{ watchlist: [], liked: [] }`

- `GET /api/recommendations/random`
  - Get random movie recommendations from credits.csv

### Movie Details
- `GET /api/movie/details?title={title}&year={year}`
  - Fetch detailed movie information from OMDb API

- `GET /api/movie/random`
  - Get a random movie from the collection

### Poster
- `GET /api/poster?title={title}&year={year}`
  - Fetch movie poster URL

## 🎯 Key Features Explained

### Smart Recommendations
The recommendation system analyzes your watchlist and liked movies to suggest films with similar genres. It:
- Extracts genres from your preferred movies
- Finds movies with matching genres
- Excludes movies you've already added
- Provides up to 30 personalized recommendations

### Optimized Search
The search functionality includes:
- **Intelligent Caching**: Results are cached for 1 minute to prevent duplicate API calls
- **Request Cancellation**: Ongoing requests are cancelled when new searches are initiated
- **Debouncing**: Search queries are debounced to reduce API calls
- **Genre Filtering**: Filter results by specific genres

### User Data Management
All user data is stored locally in the browser:
- Watchlist and liked movies
- Custom movie lists
- Movie ratings
- Activity history

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Data Source**: CSV/JSON files (no database required)

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Data Processing
npm run build:movies # Generate movies.raw.jsonl from CSV
npm run build:index  # Build search index from raw data

# Linting
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: OMDb API key for movie details
OMDB_API_KEY=your_omdb_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Data Files

- **`data/credits.csv`**: Raw movie data with cast/crew information
- **`src/data/movies.raw.jsonl`**: Processed line-delimited JSON
- **`src/data/movies.index.json`**: Search-optimized index file

## 🎨 Customization

### Themes
The app uses a dark theme with emerald accents. To customize:
- Edit `src/app/globals.css` for color scheme
- Modify Tailwind config for theme colors

### Movie Data
To add your own movie data:
1. Place CSV file in `data/` directory
2. Run `npm run build:movies` to process
3. Run `npm run build:index` to create search index

## 🐛 Troubleshooting

### Common Issues

**Movies not showing in search**
- Ensure `src/data/movies.index.json` exists
- Run `npm run build:index` to regenerate

**Poster images not loading**
- Check OMDb API key in `.env`
- Images may be missing from OMDb (shows placeholder)

**Genre filter returns 0 results**
- Movie data may not have genres populated
- Try searching by title instead

**Search keeps reloading**
- Fixed in latest version with intelligent caching
- Clear browser cache if issues persist

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

```bash
npm run build
npm run start
```

The app is fully static-friendly and can be deployed to any platform that supports Next.js.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

**Raghav Verma**
- GitHub: [@Raghaverma](https://github.com/Raghaverma)

## 🙏 Acknowledgments

- Movie data from TMDB/OMDb
- UI components from shadcn/ui
- Icons from Lucide React

---

Made with ❤️ for film lovers everywhere
