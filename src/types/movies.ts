export type Movie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  cast: string[];
  director: string;
  keywords: string[];
  overview: string;
  runtimeMin?: number;
  language?: string;
  country?: string;
  popularity?: number; // 0–100
  rating?: number;     // 0–10
  poster?: string;     // e.g. "/banners/Inception.jpg"`
};
