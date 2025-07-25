import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || "7f325eb836c6c510bab73c65fa33d484"; // User provided key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for movies
  const apiPrefix = "/api";

  // Search movies
  app.get(`${apiPrefix}/movies/search`, async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  // Get trending movies (with filter for recently released)
  app.get(`${apiPrefix}/movies/trending`, async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const recentOnly = req.query.recentOnly === 'true';
      
      // Get trending movies
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${page}`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch trending movies" });
      }
      
      const data = await response.json();
      
      // If recentOnly is true, filter movies released in the last 3 weeks
      if (recentOnly && data.results) {
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21); // 3 weeks ago
        
        data.results = data.results.filter((movie: any) => {
          if (!movie.release_date) return false;
          const releaseDate = new Date(movie.release_date);
          return releaseDate >= threeWeeksAgo;
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  // Get popular movies (with optional min rating filter)
  app.get(`${apiPrefix}/movies/popular`, async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : 0;
      
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch popular movies" });
      }
      
      const data = await response.json();
      
      // Filter by minimum rating if specified
      if (minRating > 0 && data.results) {
        data.results = data.results.filter((movie: any) => 
          movie.vote_average && movie.vote_average >= minRating
        );
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ message: "Failed to fetch popular movies" });
    }
  });
  
  // Discover movies (for "Others" section)
  app.get(`${apiPrefix}/movies/discover`, async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${page}&sort_by=popularity.desc`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to discover movies" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error discovering movies:", error);
      res.status(500).json({ message: "Failed to discover movies" });
    }
  });

  // Get movie details by ID
  app.get(`${apiPrefix}/movies/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,similar,recommendations`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
          message: errorData.status_message || "Movie not found" 
        });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Error fetching movie with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch movie details" });
    }
  });

  // Get movie credits
  app.get(`${apiPrefix}/movies/:id/credits`, async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Credits not found" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Error fetching credits for movie ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch movie credits" });
    }
  });

  // Get similar movies
  app.get(`${apiPrefix}/movies/:id/similar`, async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}/similar?api_key=${TMDB_API_KEY}`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Similar movies not found" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Error fetching similar movies for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch similar movies" });
    }
  });

  // Get movies by genre
  app.get(`${apiPrefix}/movies/genre/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${id}&page=${page}`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Genre not found" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Error fetching movies for genre ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch movies by genre" });
    }
  });

  // Get all genres
  app.get(`${apiPrefix}/genres`, async (req, res) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
      );
      
      const data = await response.json();
      res.json(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  // Add movie to watch history
  app.post(`${apiPrefix}/watch-history`, async (req, res) => {
    try {
      const { movieId } = req.body;
      
      if (!movieId) {
        return res.status(400).json({ message: "Movie ID is required" });
      }
      
      // Check if the movie exists in TMDB
      const movieResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
      );
      
      if (!movieResponse.ok) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      const movieData = await movieResponse.json() as any;
      
      try {
        // Store movie in database if it doesn't exist
        const existingMovie = await storage.getMovieById(movieId);
        
        if (!existingMovie) {
          await storage.addMovie({
            id: movieId,
            title: movieData.title,
            overview: movieData.overview,
            posterPath: movieData.poster_path,
            backdropPath: movieData.backdrop_path,
            releaseDate: movieData.release_date,
            voteAverage: typeof movieData.vote_average === 'number' ? movieData.vote_average.toString() : null,
            runtime: typeof movieData.runtime === 'number' ? movieData.runtime : null,
            tmdbId: movieId,
            createdAt: new Date(),
          });
          
          // Add genres if they don't exist
          if (movieData.genres && Array.isArray(movieData.genres) && movieData.genres.length > 0) {
            for (const genre of movieData.genres) {
              try {
                const existingGenre = await storage.getGenreById(genre.id);
                
                if (!existingGenre) {
                  await storage.addGenre({
                    id: genre.id,
                    name: genre.name,
                  });
                }
                
                // Link movie to genre
                await storage.addMovieGenre({
                  movieId,
                  genreId: genre.id,
                });
              } catch (genreError) {
                console.error(`Error with genre ${genre.id}:`, genreError);
                // Continue with other genres
              }
            }
          }
        }
      } catch (movieError) {
        console.error("Error adding movie:", movieError);
        // Proceed with watch history regardless of movie error
        // The movie might already exist due to a race condition
      }
      
      // Add to watch history
      // Note: For simplicity, we're not requiring user authentication here
      await storage.addWatchHistory({
        userId: null,
        movieId,
      });
      
      res.status(201).json({ message: "Added to watch history" });
    } catch (error) {
      console.error("Error adding to watch history:", error);
      res.status(500).json({ message: "Failed to add to watch history" });
    }
  });

  // Get watch history
  app.get(`${apiPrefix}/watch-history`, async (req, res) => {
    try {
      // For simplicity, we're getting all watch history without user authentication
      const watchHistory = await storage.getWatchHistory();
      res.json(watchHistory);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      res.status(500).json({ message: "Failed to fetch watch history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
