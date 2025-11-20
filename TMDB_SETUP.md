# TMDb API Setup

## Environment Variable

Add the following to your `.env.local` file:

```
TMDB_API_KEY=d707f94c32c19e6f6e298e5d5d4fbd46
```

## Implementation Details

- TMDb is now the primary source for movie details and posters
- OMDb is used as a fallback when TMDb fails
- TMDb attribution is displayed in the footer per their requirements
- API key is only used server-side (never exposed to client)

## Testing

After adding the API key, test by:
1. Opening a movie details modal
2. Checking that movie information loads from TMDb
3. Verifying TMDb attribution appears in the footer

