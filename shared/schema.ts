import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Movie-related tables
export const movies = pgTable("movies", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  overview: text("overview"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  voteAverage: text("vote_average"),
  runtime: integer("runtime"),
  tmdbId: integer("tmdb_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const genres = pgTable("genres", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const movieGenres = pgTable("movie_genres", {
  movieId: integer("movie_id").notNull().references(() => movies.id),
  genreId: integer("genre_id").notNull().references(() => genres.id),
});

export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  movieId: integer("movie_id").references(() => movies.id),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
});

// Relations
export const moviesRelations = relations(movies, ({ many }) => ({
  genres: many(movieGenres),
  watchHistory: many(watchHistory),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  movies: many(movieGenres),
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, { fields: [movieGenres.movieId], references: [movies.id] }),
  genre: one(genres, { fields: [movieGenres.genreId], references: [genres.id] }),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, { fields: [watchHistory.userId], references: [users.id] }),
  movie: one(movies, { fields: [watchHistory.movieId], references: [movies.id] }),
}));

// Schemas
export const insertMovieSchema = createInsertSchema(movies);
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export const insertGenreSchema = createInsertSchema(genres);
export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type Genre = typeof genres.$inferSelect;

export const insertMovieGenreSchema = createInsertSchema(movieGenres);
export type InsertMovieGenre = z.infer<typeof insertMovieGenreSchema>;
export type MovieGenre = typeof movieGenres.$inferSelect;

export const insertWatchHistorySchema = createInsertSchema(watchHistory);
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistory.$inferSelect;
