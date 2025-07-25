import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import MovieCard from './MovieCard';
import { addToWatchHistory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
}

interface InfiniteScrollProps {
  queryKey: any[];
  fetchFn: (page: number) => Promise<{ results: Movie[]; total_pages: number }>;
  title: string;
}

const InfiniteScroll = ({ queryKey, fetchFn, title }: InfiniteScrollProps) => {
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Create a function to fetch data that properly works with React Query
  const fetchData = async () => {
    try {
      return await fetchFn(page);
    } catch (error) {
      console.error("Error fetching data in InfiniteScroll:", error);
      throw error;
    }
  };

  // Fetch initial data
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: fetchData,
  });

  // Update movies when data changes
  useEffect(() => {
    if (data) {
      const results = data.results || [];
      const totalPages = data.total_pages || 1;
      
      if (page === 1) {
        setAllMovies(results);
      } else {
        setAllMovies(prev => [...prev, ...results]);
      }
      setHasMore(page < totalPages);
      setIsLoadingMore(false);
    }
  }, [data, page]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setIsLoadingMore(true);
          setPage(prevPage => prevPage + 1);
        }
      },
      { rootMargin: '100px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, isLoadingMore]);

  const handleWatchClick = async (movieId: number) => {
    try {
      await addToWatchHistory(movieId);
      
      // Open Telegram bot in new tab
      window.open(`https://t.me/your_movie_bot?start=${movieId}`, '_blank');
      
      toast({
        title: "Movie added to watch history",
        description: "Opening Telegram bot to watch the movie.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add movie to watch history.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-white text-2xl font-bold mb-4">{title}</h2>
      
      {isLoading && page === 1 && (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && page === 1 && (
        <div className="bg-netflix-dark p-8 rounded-lg text-center">
          <i className="fas fa-exclamation-triangle text-netflix-red text-4xl mb-4"></i>
          <p className="text-white text-lg">Failed to load movies.</p>
          <p className="text-gray-400 mt-2">Please try again later.</p>
        </div>
      )}
      
      {allMovies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allMovies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onWatchClick={handleWatchClick} 
            />
          ))}
        </div>
      )}
      
      {/* Loader element for intersection observer */}
      <div 
        ref={loaderRef} 
        className={`flex justify-center py-10 ${isLoadingMore && hasMore ? 'block' : 'hidden'}`}
      >
        <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {!hasMore && allMovies.length > 0 && (
        <div className="text-center mt-6">
          <p className="text-gray-400">You've reached the end</p>
        </div>
      )}
    </section>
  );
};

export default InfiniteScroll;
