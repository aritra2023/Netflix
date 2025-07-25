import MovieCard from './MovieCard';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { 
  fetchTrendingMovies, 
  fetchPopularMovies, 
  fetchMoviesByGenre, 
  fetchAllMovies,
  getStreamingUrl
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FilterParams {
  recentOnly?: boolean;
  minRating?: number;
}

interface MovieGridProps {
  title: string;
  viewAllLink?: string;
  type: 'trending' | 'popular' | 'genre' | 'discover';
  genreId?: string;
  filterParams?: FilterParams;
}

const MovieGrid = ({ 
  title, 
  viewAllLink, 
  type, 
  genreId, 
  filterParams = {} 
}: MovieGridProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { recentOnly, minRating } = filterParams;
  const [showAll, setShowAll] = useState(true); // Start with showing all movies
  const [allMovies, setAllMovies] = useState<any[]>([]);

  // Create query key based on type and filters
  let queryKey: any[] = [];

  if (type === 'trending') {
    queryKey = ['/api/movies/trending', recentOnly];
  } else if (type === 'popular') {
    queryKey = ['/api/movies/popular', minRating];
  } else if (type === 'genre') {
    queryKey = ['/api/movies/genre', genreId];
  } else {
    queryKey = ['/api/movies/discover'];
  }

  // Fetching data with proper query handling
  const fetchData = async () => {
    try {
      if (type === 'trending') {
        return await fetchTrendingMovies(recentOnly);
      } else if (type === 'popular') {
        return await fetchPopularMovies(minRating);
      } else if (type === 'genre') {
        return await fetchMoviesByGenre(genreId!);
      } else if (type === 'discover') {
        return await fetchAllMovies();
      }
      return { results: [] };
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  };

  // Fetch additional pages for discover type when showing all
  const fetchAllDiscoverMovies = async () => {
    if (type !== 'discover') return;
    
    try {
      const promises = [];
      // Fetch up to 25 pages to get ~500 movies (each page has ~20 movies)
      for (let page = 1; page <= 25; page++) {
        promises.push(fetchAllMovies(page));
      }
      
      const results = await Promise.all(promises);
      const combinedMovies: any[] = [];
      
      results.forEach(result => {
        if (result?.results) {
          combinedMovies.push(...result.results);
        }
      });
      
      // Remove duplicates and limit to 500
      const uniqueMovies = combinedMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      ).slice(0, 500);
      
      setAllMovies(uniqueMovies);
    } catch (error) {
      console.error("Error fetching all discover movies:", error);
      toast({
        title: "Error",
        description: "Failed to load additional movies.",
        variant: "destructive",
      });
    }
  };

  const { data: movieData, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchData
  });

  // Auto-fetch all movies for discover type on component mount
  const { data: allDiscoverData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['discover-all', type],
    queryFn: async () => {
      if (type !== 'discover') return null;
      
      const promises = [];
      // Fetch up to 25 pages to get ~500 movies (each page has ~20 movies)
      for (let page = 1; page <= 25; page++) {
        promises.push(fetchAllMovies(page));
      }
      
      const results = await Promise.all(promises);
      const combinedMovies: any[] = [];
      
      results.forEach(result => {
        if (result?.results) {
          combinedMovies.push(...result.results);
        }
      });
      
      // Remove duplicates and limit to 500
      const uniqueMovies = combinedMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      ).slice(0, 500);
      
      return uniqueMovies;
    },
    enabled: type === 'discover'
  });

  // Set all movies when data is loaded
  useEffect(() => {
    if (allDiscoverData && type === 'discover') {
      setAllMovies(allDiscoverData);
    }
  }, [allDiscoverData]);

  // Extract movies array from data safely
  const movies = movieData?.results || [];

  const handleWatchClick = async (movieId: number) => {
    try {
      const streamingUrl = await getStreamingUrl(movieId);
      if (streamingUrl) {
        //Open the video in a new tab or use a video player component
        window.open(streamingUrl, '_blank');
        toast({ title: "Playing movie...", description: "" });
      } else {
        toast({ title: "Error", description: "Streaming URL not found for this movie.", variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get streaming URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <button 
            onClick={async () => {
              if (type === 'discover') {
                if (showAll) {
                  setShowAll(false);
                } else {
                  setShowAll(true);
                }
              } else if (type === 'trending') {
                setLocation('/trending');
              } else if (type === 'popular') {
                setLocation('/popular');
              } else {
                setLocation(viewAllLink);
              }
            }}
            className="text-gray-400 hover:text-netflix-red text-sm transition cursor-pointer"
          >
            {type === 'discover' ? (showAll ? 'Show Less' : 'Show All') : 'View All'}
          </button>
        )}
      </div>

      {(isLoading || (type === 'discover' && isLoadingAll)) && (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="bg-netflix-dark p-8 rounded-lg text-center">
          <i className="fas fa-exclamation-triangle text-netflix-red text-4xl mb-4"></i>
          <p className="text-white text-lg">Failed to load movies.</p>
          <p className="text-gray-400 mt-2">Please try again later.</p>
        </div>
      )}

      {movies && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(() => {
            if (type === 'discover') {
              if (showAll && allMovies.length > 0) {
                return allMovies;
              } else {
                return movies.slice(0, 20);
              }
            }
            return movies;
          })().map((movie: any, index: number) => (
            <MovieCard 
              key={`${movie.id}-${index}`} 
              movie={movie} 
              onWatchClick={handleWatchClick} 
            />
          ))}
        </div>
      )}

      {movies && movies.length === 0 && !isLoading && !error && (
        <div className="bg-netflix-dark p-8 rounded-lg text-center">
          <i className="fas fa-film text-netflix-red text-4xl mb-4"></i>
          <p className="text-white text-lg">No movies found.</p>
        </div>
      )}
    </section>
  );
};

export default MovieGrid;