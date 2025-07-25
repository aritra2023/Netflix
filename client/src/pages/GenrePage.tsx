
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import MobileMenu from '@/components/MobileMenu';
import BackToTop from '@/components/BackToTop';
import { fetchMoviesByGenre, fetchGenres, addToWatchHistory } from '@/lib/api';
import Footer from "@/components/Footer";
import MovieCard from '@/components/MovieCard';
import { useToast } from '@/hooks/use-toast';

const GenrePage = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll to top when the component mounts or genre changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setAllMovies([]);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [id]);

  // Fetch genre details
  const { data: genres, isLoading: isLoadingGenres, error: genreError } = useQuery({
    queryKey: ['/api/genres'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch initial movies for this genre
  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['/api/movies/genre', id, 1],
    queryFn: () => fetchMoviesByGenre(id!, 1),
    enabled: !!id,
  });

  // Load more movies when page changes
  const { data: moreData } = useQuery({
    queryKey: ['/api/movies/genre', id, page],
    queryFn: () => fetchMoviesByGenre(id!, page),
    enabled: page > 1 && !!id,
  });

  // Handle initial data
  useEffect(() => {
    if (initialData?.results) {
      setAllMovies(initialData.results);
      setHasMore(initialData.total_pages > 1);
    }
  }, [initialData]);

  // Handle loading more data
  useEffect(() => {
    if (moreData?.results && page > 1) {
      setAllMovies(prev => [...prev, ...moreData.results]);
      setHasMore(page < moreData.total_pages && allMovies.length < 100);
      setIsLoadingMore(false);
    }
  }, [moreData, page]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore && allMovies.length < 100) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  const handleWatchClick = async (movieId: number) => {
    try {
      await addToWatchHistory(movieId);
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

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, allMovies.length]);

  // Find the current genre name
  const currentGenre = genres?.find(g => g.id.toString() === id);

  // Handle errors
  if (genreError || error) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Header />
        <MobileMenu />
        <main className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <i className="fas fa-exclamation-triangle text-netflix-red text-5xl mb-4"></i>
            <h1 className="text-white text-2xl font-bold mb-4">Error Loading Movies</h1>
            <p className="text-gray-400 mb-8">We couldn't load the movies for this genre. Please try again later.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-netflix-red hover:bg-opacity-80 text-white py-2 px-6 rounded transition"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Header />
      <MobileMenu />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {isLoadingGenres ? (
          <div className="py-10">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">
                {currentGenre ? currentGenre.name : 'Unknown'} Movies
              </h1>
              <p className="text-gray-400">
                Explore our collection of {currentGenre ? currentGenre.name.toLowerCase() : ''} movies
              </p>
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array(20).fill(0).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            )}

            {allMovies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allMovies.slice(0, 100).map((movie: any, index: number) => (
                  <MovieCard 
                    key={`${movie.id}-${index}`} 
                    movie={movie} 
                    onWatchClick={handleWatchClick} 
                  />
                ))}
              </div>
            )}

            {/* Loading more indicator */}
            {isLoadingMore && hasMore && (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* End of results message */}
            {(allMovies.length >= 100 || !hasMore) && allMovies.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-400">
                  {allMovies.length >= 100 ? (
                    <>Showing top <span style={{ color: '#E50914', fontWeight: 'bold' }}>100</span> {currentGenre ? currentGenre.name.toLowerCase() : ''} movies</>
                  ) : (
                    "You've reached the end!"
                  )}
                </p>
              </div>
            )}

            {allMovies.length === 0 && !isLoading && !error && (
              <div className="bg-netflix-dark p-8 rounded-lg text-center">
                <i className="fas fa-film text-netflix-red text-4xl mb-4"></i>
                <p className="text-white text-lg">No {currentGenre ? currentGenre.name.toLowerCase() : ''} movies found.</p>
              </div>
            )}
          </>
        )}
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
};

export default GenrePage;
