import { apiRequest } from "./queryClient";

// API routes for movies
export const fetchTrendingMovies = async (recentOnly: boolean = false, page: number = 1) => {
  const url = `/api/movies/trending?recentOnly=${recentOnly}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  return res.json();
};

export const fetchMovieById = async (id: string) => {
  const res = await fetch(`/api/movies/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch movie with id ${id}`);
  return res.json();
};

export const fetchMoviesByGenre = async (genreId: string, page: number = 1) => {
  const res = await fetch(`/api/movies/genre/${genreId}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch movies for genre ${genreId}`);
  return res.json();
};

export const fetchPopularMovies = async (minRating: number = 0, page: number = 1) => {
  const url = `/api/movies/popular?minRating=${minRating}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch popular movies');
  return res.json();
};

export const fetchAllMovies = async (page: number = 1) => {
  const res = await fetch(`/api/movies/discover?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch other movies');
  return res.json();
};

export const fetchSimilarMovies = async (movieId: string) => {
  const res = await fetch(`/api/movies/${movieId}/similar`);
  if (!res.ok) throw new Error(`Failed to fetch similar movies for ${movieId}`);
  return res.json();
};

export const fetchMovieCredits = async (movieId: string) => {
  const res = await fetch(`/api/movies/${movieId}/credits`);
  if (!res.ok) throw new Error(`Failed to fetch movie credits for ${movieId}`);
  return res.json();
};

export const searchMovies = async (query: string) => {
  const res = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search movies');
  return res.json();
};

export const fetchGenres = async () => {
  const res = await fetch('/api/genres');
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
};

export const getStreamingUrl = (movieId: number, quality: 'hd' | 'fhd' = 'hd') => {
  const baseUrl = `https://vidsrc.xyz/embed/movie/${movieId}`;
  return `${baseUrl}?api_key=4789fec446eaf7997af0&quality=${quality}`;
};

export const addToWatchHistory = async (movieId: number) => {
  return apiRequest('POST', '/api/watch-history', { movieId });
};

export const getWatchHistory = async () => {
  const res = await fetch('/api/watch-history');
  if (!res.ok) throw new Error('Failed to fetch watch history');
  return res.json();
};