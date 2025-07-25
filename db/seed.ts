import { db } from "./index";
import * as schema from "@shared/schema";
import fetch from "node-fetch";
import { eq } from "drizzle-orm";

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || "7f325eb836c6c510bab73c65fa33d484"; // User provided key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchGenres() {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json() as { genres?: any[] };
    return data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

async function fetchTrendingMovies(page = 1) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${page}`
    );
    const data = await response.json() as { results?: any[] };
    return data.results || [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}

async function fetchMovieDetails(movieId: number) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json() as { runtime?: number };
    return data || {};
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return {};
  }
}

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed genres
    console.log("Seeding genres...");
    const genres = await fetchGenres();
    
    if (!Array.isArray(genres)) {
      console.error("Error: genres is not an array", genres);
      return;
    }
    
    for (const genre of genres) {
      // Check if genre already exists
      const existingGenre = await db.query.genres.findFirst({
        where: eq(schema.genres.id, genre.id)
      });
      
      if (!existingGenre) {
        await db.insert(schema.genres).values({
          id: genre.id,
          name: genre.name
        });
        console.log(`Added genre: ${genre.name}`);
      } else {
        console.log(`Genre ${genre.name} already exists, skipping`);
      }
    }

    // Seed trending movies
    console.log("Seeding trending movies...");
    const trendingMovies = await fetchTrendingMovies();
    
    if (!Array.isArray(trendingMovies)) {
      console.error("Error: trendingMovies is not an array", trendingMovies);
      return;
    }
    
    for (const movie of trendingMovies) {
      // Check if movie already exists
      const existingMovie = await db.query.movies.findFirst({
        where: eq(schema.movies.id, movie.id)
      });
      
      if (!existingMovie) {
        // Fetch full movie details to get runtime
        const movieDetails = await fetchMovieDetails(movie.id);
        
        const runtime = typeof movieDetails?.runtime === 'number' ? movieDetails.runtime : null;
        
        await db.insert(schema.movies).values({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date,
          voteAverage: typeof movie.vote_average === 'number' ? movie.vote_average.toString() : null,
          runtime: runtime,
          tmdbId: movie.id,
          createdAt: new Date() // Add the required createdAt field
        });
        console.log(`Added movie: ${movie.title}`);
        
        // Link movie to genres
        if (movie.genre_ids && movie.genre_ids.length > 0) {
          for (const genreId of movie.genre_ids) {
            // Check if movie-genre relationship already exists
            const existingRelation = await db.query.movieGenres.findFirst({
              where: (fields) => eq(fields.movieId, movie.id) && eq(fields.genreId, genreId)
            });
            
            if (!existingRelation) {
              await db.insert(schema.movieGenres).values({
                movieId: movie.id,
                genreId: genreId
              });
              console.log(`Linked movie ${movie.title} to genre ID ${genreId}`);
            }
          }
        }
      } else {
        console.log(`Movie ${movie.title} already exists, skipping`);
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
