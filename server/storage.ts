import { db } from "@db";
import { 
  movies, 
  genres, 
  movieGenres, 
  watchHistory,
  insertMovieSchema,
  insertGenreSchema,
  insertMovieGenreSchema,
  insertWatchHistorySchema,
  type Movie,
  type Genre,
  type MovieGenre,
  type WatchHistory
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export const storage = {
  // Movie operations
  async addMovie(movie: Movie) {
    try {
      const validatedMovie = insertMovieSchema.parse(movie);
      const [newMovie] = await db.insert(movies).values(validatedMovie).returning();
      return newMovie;
    } catch (error) {
      console.error("Error adding movie:", error);
      throw error;
    }
  },

  async getMovieById(id: number) {
    try {
      return await db.query.movies.findFirst({
        where: eq(movies.id, id)
      });
    } catch (error) {
      console.error(`Error getting movie with ID ${id}:`, error);
      throw error;
    }
  },

  async getMoviesByGenre(genreId: number) {
    try {
      const result = await db.query.movieGenres.findMany({
        where: eq(movieGenres.genreId, genreId),
        with: {
          movie: true
        }
      });
      return result.map(r => r.movie);
    } catch (error) {
      console.error(`Error getting movies for genre ${genreId}:`, error);
      throw error;
    }
  },

  // Genre operations
  async addGenre(genre: Genre) {
    try {
      const validatedGenre = insertGenreSchema.parse(genre);
      const [newGenre] = await db.insert(genres).values(validatedGenre).returning();
      return newGenre;
    } catch (error) {
      console.error("Error adding genre:", error);
      throw error;
    }
  },

  async getGenreById(id: number) {
    try {
      return await db.query.genres.findFirst({
        where: eq(genres.id, id)
      });
    } catch (error) {
      console.error(`Error getting genre with ID ${id}:`, error);
      throw error;
    }
  },

  async getAllGenres() {
    try {
      return await db.query.genres.findMany();
    } catch (error) {
      console.error("Error getting all genres:", error);
      throw error;
    }
  },

  // Movie-Genre relationship
  async addMovieGenre(movieGenre: MovieGenre) {
    try {
      const validatedMovieGenre = insertMovieGenreSchema.parse(movieGenre);
      
      // Check if the relation already exists
      const existing = await db.query.movieGenres.findFirst({
        where: and(
          eq(movieGenres.movieId, movieGenre.movieId),
          eq(movieGenres.genreId, movieGenre.genreId)
        )
      });
      
      if (existing) {
        return existing;
      }
      
      const [newMovieGenre] = await db.insert(movieGenres).values(validatedMovieGenre).returning();
      return newMovieGenre;
    } catch (error) {
      console.error("Error adding movie-genre relationship:", error);
      throw error;
    }
  },

  // Watch history operations
  async addWatchHistory(historyEntry: Partial<WatchHistory>) {
    try {
      const validatedHistory = insertWatchHistorySchema.parse({
        ...historyEntry,
        watchedAt: new Date()
      });
      
      const [newEntry] = await db.insert(watchHistory).values(validatedHistory).returning();
      return newEntry;
    } catch (error) {
      console.error("Error adding to watch history:", error);
      throw error;
    }
  },

  async getWatchHistory() {
    try {
      return await db.query.watchHistory.findMany({
        with: {
          movie: true
        },
        orderBy: desc(watchHistory.watchedAt)
      });
    } catch (error) {
      console.error("Error getting watch history:", error);
      throw error;
    }
  }
};
