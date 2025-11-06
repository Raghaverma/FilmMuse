"use client";

type UserRecord = {
  email: string;
  username: string;
  password: string;
  preferences?: Record<string, unknown>;
};

const LS_USERS_KEY = "filmmuse_users_v1";

function readUsers(): Record<string, UserRecord> {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UserRecord>) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, UserRecord>) {
  try {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, options?: { path?: string; maxAge?: number }) {
  if (typeof document === "undefined") return;
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options?.path ?? "/"}`,
    "SameSite=Lax",
  ];
  if (options?.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
  document.cookie = parts.join("; ");
}

export function deleteCookie(name: string) {
  setCookie(name, "", { path: "/", maxAge: 0 });
}

export function getCurrentUser(): UserRecord | null {
  const uid = getCookie("uid");
  if (!uid) return null;
  const users = readUsers();
  return users[uid] ?? null;
}

export async function login(args: { email: string; password: string }) {
  const email = args.email.trim().toLowerCase();
  const password = args.password;
  if (!email || !password) throw new Error("Missing credentials");
  const users = readUsers();
  const user = users[email];
  if (!user || user.password !== password) throw new Error("Invalid credentials");
  setCookie("auth", "1", { path: "/" });
  setCookie("uid", email, { path: "/" });
}

export async function signup(args: { email: string; password: string; username: string }) {
  const email = args.email.trim().toLowerCase();
  const username = args.username.trim();
  const password = args.password;
  if (!email || !username || !password) throw new Error("All fields are required");
  const users = readUsers();
  if (users[email]) throw new Error("User already exists");
  users[email] = { email, username, password };
  writeUsers(users);
  setCookie("auth", "1", { path: "/" });
  setCookie("uid", email, { path: "/" });
}

export async function updateProfile(partial: Partial<Pick<UserRecord, "username" | "preferences">>) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const users = readUsers();
  const cur = users[uid];
  if (!cur) throw new Error("User not found");
  users[uid] = { ...cur, ...partial } as UserRecord;
  writeUsers(users);
}

export async function logoutClientSide() {
  deleteCookie("auth");
  deleteCookie("uid");
}

// Watchlist functionality
type MovieItem = {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
};

type UserWatchlist = {
  watchlist: MovieItem[]; // Movies user wants to watch
  liked: MovieItem[]; // Movies user likes
};

const LS_WATCHLIST_KEY = "filmmuse_watchlist_v1";

function readWatchlists(): Record<string, UserWatchlist> {
  try {
    const raw = localStorage.getItem(LS_WATCHLIST_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UserWatchlist>) : {};
  } catch {
    return {};
  }
}

function writeWatchlists(watchlists: Record<string, UserWatchlist>) {
  try {
    localStorage.setItem(LS_WATCHLIST_KEY, JSON.stringify(watchlists));
  } catch {
    // ignore
  }
}

export function getUserWatchlist(): UserWatchlist {
  const uid = getCookie("uid");
  if (!uid) return { watchlist: [], liked: [] };
  const watchlists = readWatchlists();
  return watchlists[uid] ?? { watchlist: [], liked: [] };
}

export function removeFromWatchlist(movieId: string) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const watchlists = readWatchlists();
  const userList = watchlists[uid] ?? { watchlist: [], liked: [] };
  userList.watchlist = userList.watchlist.filter(m => m.id !== movieId);
  watchlists[uid] = userList;
  writeWatchlists(watchlists);
}

export function removeFromLiked(movieId: string) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const watchlists = readWatchlists();
  const userList = watchlists[uid] ?? { watchlist: [], liked: [] };
  userList.liked = userList.liked.filter(m => m.id !== movieId);
  watchlists[uid] = userList;
  writeWatchlists(watchlists);
}

// Custom Lists functionality
type CustomList = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  movies: MovieItem[];
};

const LS_CUSTOM_LISTS_KEY = "filmmuse_custom_lists_v1";

function readCustomLists(): Record<string, Record<string, CustomList>> {
  try {
    const raw = localStorage.getItem(LS_CUSTOM_LISTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Record<string, CustomList>>) : {};
  } catch {
    return {};
  }
}

function writeCustomLists(lists: Record<string, Record<string, CustomList>>) {
  try {
    localStorage.setItem(LS_CUSTOM_LISTS_KEY, JSON.stringify(lists));
  } catch {
    // ignore
  }
}

export function getUserCustomLists(): CustomList[] {
  const uid = getCookie("uid");
  if (!uid) return [];
  const allLists = readCustomLists();
  const userLists = allLists[uid] ?? {};
  return Object.values(userLists);
}

export function createCustomList(name: string, description?: string): CustomList {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const allLists = readCustomLists();
  const userLists = allLists[uid] ?? {};
  const id = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newList: CustomList = {
    id,
    name: name.trim(),
    description: description?.trim(),
    createdAt: Date.now(),
    movies: [],
  };
  userLists[id] = newList;
  allLists[uid] = userLists;
  writeCustomLists(allLists);
  addActivity({ type: "list_created", listId: id, listName: name });
  return newList;
}

export function updateCustomList(listId: string, updates: { name?: string; description?: string }): CustomList {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const allLists = readCustomLists();
  const userLists = allLists[uid] ?? {};
  const list = userLists[listId];
  if (!list) throw new Error("List not found");
  if (updates.name) list.name = updates.name.trim();
  if (updates.description !== undefined) list.description = updates.description.trim();
  allLists[uid] = userLists;
  writeCustomLists(allLists);
  addActivity({ type: "list_updated", listId, listName: list.name });
  return list;
}

export function deleteCustomList(listId: string) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const allLists = readCustomLists();
  const userLists = allLists[uid] ?? {};
  const list = userLists[listId];
  if (list) {
    delete userLists[listId];
    allLists[uid] = userLists;
    writeCustomLists(allLists);
    addActivity({ type: "list_deleted", listId, listName: list.name });
  }
}

export function addMovieToCustomList(listId: string, movie: MovieItem) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const allLists = readCustomLists();
  const userLists = allLists[uid] ?? {};
  const list = userLists[listId];
  if (!list) throw new Error("List not found");
  if (!list.movies.some(m => m.id === movie.id)) {
    list.movies.push(movie);
    allLists[uid] = userLists;
    writeCustomLists(allLists);
    addActivity({ type: "movie_added_to_list", listId, listName: list.name, movieId: movie.id, movieTitle: movie.title });
  }
}

export function removeMovieFromCustomList(listId: string, movieId: string) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const allLists = readCustomLists();
  const userLists = allLists[uid] ?? {};
  const list = userLists[listId];
  if (!list) throw new Error("List not found");
  list.movies = list.movies.filter(m => m.id !== movieId);
  allLists[uid] = userLists;
  writeCustomLists(allLists);
}

// Ratings functionality
type MovieRating = {
  movieId: string;
  movieTitle: string;
  movieYear?: number;
  moviePoster?: string | null;
  rating: number; // 1-5 stars
  ratedAt: number;
};

const LS_RATINGS_KEY = "filmmuse_ratings_v1";

function readRatings(): Record<string, Record<string, MovieRating>> {
  try {
    const raw = localStorage.getItem(LS_RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Record<string, MovieRating>>) : {};
  } catch {
    return {};
  }
}

function writeRatings(ratings: Record<string, Record<string, MovieRating>>) {
  try {
    localStorage.setItem(LS_RATINGS_KEY, JSON.stringify(ratings));
  } catch {
    // ignore
  }
}

export function getUserRatings(): Record<string, MovieRating> {
  const uid = getCookie("uid");
  if (!uid) return {};
  const allRatings = readRatings();
  return allRatings[uid] ?? {};
}

export function rateMovie(movieId: string, movieTitle: string, rating: number, movieYear?: number, moviePoster?: string | null) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  const allRatings = readRatings();
  const userRatings = allRatings[uid] ?? {};
  userRatings[movieId] = {
    movieId,
    movieTitle,
    movieYear,
    moviePoster,
    rating,
    ratedAt: Date.now(),
  };
  allRatings[uid] = userRatings;
  writeRatings(allRatings);
  addActivity({ type: "movie_rated", movieId, movieTitle, rating });
}

export function removeRating(movieId: string) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const allRatings = readRatings();
  const userRatings = allRatings[uid] ?? {};
  delete userRatings[movieId];
  allRatings[uid] = userRatings;
  writeRatings(allRatings);
}

// Activity Feed functionality
export type ActivityType = 
  | { type: "movie_added_to_watchlist"; movieId: string; movieTitle: string }
  | { type: "movie_liked"; movieId: string; movieTitle: string }
  | { type: "movie_rated"; movieId: string; movieTitle: string; rating: number }
  | { type: "list_created"; listId: string; listName: string }
  | { type: "list_updated"; listId: string; listName: string }
  | { type: "list_deleted"; listId: string; listName: string }
  | { type: "movie_added_to_list"; listId: string; listName: string; movieId: string; movieTitle: string };

export type Activity = ActivityType & {
  timestamp: number;
};

const LS_ACTIVITY_KEY = "filmmuse_activity_v1";
const MAX_ACTIVITIES = 50;

function readActivities(): Record<string, Activity[]> {
  try {
    const raw = localStorage.getItem(LS_ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Activity[]>) : {};
  } catch {
    return {};
  }
}

function writeActivities(activities: Record<string, Activity[]>) {
  try {
    localStorage.setItem(LS_ACTIVITY_KEY, JSON.stringify(activities));
  } catch {
    // ignore
  }
}

function addActivity(activity: ActivityType) {
  const uid = getCookie("uid");
  if (!uid) return;
  const allActivities = readActivities();
  const userActivities = allActivities[uid] ?? [];
  const newActivity: Activity = {
    ...activity,
    timestamp: Date.now(),
  };
  userActivities.unshift(newActivity);
  // Keep only the most recent activities
  if (userActivities.length > MAX_ACTIVITIES) {
    userActivities.splice(MAX_ACTIVITIES);
  }
  allActivities[uid] = userActivities;
  writeActivities(allActivities);
}

export function getUserActivities(): Activity[] {
  const uid = getCookie("uid");
  if (!uid) return [];
  const allActivities = readActivities();
  return allActivities[uid] ?? [];
}

// Update existing functions to track activity
export function addToWatchlist(movie: MovieItem) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const watchlists = readWatchlists();
  const userList = watchlists[uid] ?? { watchlist: [], liked: [] };
  
  // Check if already in watchlist
  if (!userList.watchlist.some(m => m.id === movie.id)) {
    userList.watchlist.push(movie);
    watchlists[uid] = userList;
    writeWatchlists(watchlists);
    addActivity({ type: "movie_added_to_watchlist", movieId: movie.id, movieTitle: movie.title });
  }
}

export function addToLiked(movie: MovieItem) {
  const uid = getCookie("uid");
  if (!uid) throw new Error("Not authenticated");
  const watchlists = readWatchlists();
  const userList = watchlists[uid] ?? { watchlist: [], liked: [] };
  
  // Check if already in liked
  if (!userList.liked.some(m => m.id === movie.id)) {
    userList.liked.push(movie);
    watchlists[uid] = userList;
    writeWatchlists(watchlists);
    addActivity({ type: "movie_liked", movieId: movie.id, movieTitle: movie.title });
  }
}



