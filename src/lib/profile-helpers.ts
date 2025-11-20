export function normalizeList(l: {
  id: string;
  name: string;
  description?: string;
  createdAt: number | { toMillis: () => number };
  movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>;
  sharedWith?: string[];
  isPublic?: boolean;
}) {
  return {
    id: l.id,
    name: l.name,
    description: l.description,
    createdAt: typeof l.createdAt === 'number' ? l.createdAt : Date.now(),
    movies: l.movies,
    sharedWith: l.sharedWith || [],
    isPublic: l.isPublic || false
  };
}

