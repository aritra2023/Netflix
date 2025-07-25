import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import MobileMenu from '@/components/MobileMenu';
import HeroSection from '@/components/HeroSection';
import MovieGrid from '@/components/MovieGrid';
import GenreSelector from '@/components/GenreSelector';
import BackToTop from '@/components/BackToTop';
import InfiniteScroll from '@/components/InfiniteScroll';
import { 
  fetchTrendingMovies, 
  fetchPopularMovies,
  fetchAllMovies,
  addToWatchHistory 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import Footer from "@/components/Footer";

const Home = () => {
  const { toast } = useToast();
  const [location] = useLocation();
  const [section, setSection] = useState<string | null>(null);

  // Extract section parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    setSection(params.get('section'));
  }, [location]);

  // Fetch trending movies for hero section
  const { data: trendingMoviesData, isLoading } = useQuery({
    queryKey: ['/api/movies/trending'],
    queryFn: () => fetchTrendingMovies(),
  });

  const trendingMovies = trendingMoviesData as any;

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

  // Get a random trending movie for the hero section
  const heroMovie = trendingMovies?.results?.length > 0 
    ? trendingMovies.results[Math.floor(Math.random() * trendingMovies.results.length)]
    : null;

  return (
    <div className="min-h-screen bg-netflix-black">
      <Header />
      <MobileMenu />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        {isLoading ? (
          <div className="relative rounded-lg overflow-hidden" style={{ height: '50vh', minHeight: '400px' }}>
            <Skeleton className="w-full h-full" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <Skeleton className="h-12 w-1/3 mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : heroMovie ? (
          <HeroSection movie={heroMovie} onWatchClick={handleWatchClick} />
        ) : null}

        {/* All Trending Movies */}
        {(section === null || section === 'trending') && (
          <MovieGrid 
            title="Trending Now" 
            viewAllLink="/?section=trending" 
            type="trending"
          />
        )}

        {/* Genre Selector */}
        {(section === null || section === 'genres') && (
          <GenreSelector />
        )}

        {/* All Popular Movies */}
        {(section === null || section === 'popular') && (
          <MovieGrid 
            title="Popular Movies" 
            viewAllLink="/?section=popular" 
            type="popular"
          />
        )}

        {/* Other Movies Section */}
        {(section === null || section === 'others') && (
          <MovieGrid 
            title="Other Movies" 
            viewAllLink="/?section=others" 
            type="discover"
          />
        )}

        {/* Infinite Scroll for Sections */}
        {section === 'trending' && (
          <InfiniteScroll 
            queryKey={['/api/movies/trending', false]}
            fetchFn={(page) => fetchTrendingMovies(false, page)}
            title="All Trending Movies"
          />
        )}

        {section === 'popular' && (
          <InfiniteScroll 
            queryKey={['/api/movies/popular', 0]}
            fetchFn={(page) => fetchPopularMovies(0, page)}
            title="All Popular Movies"
          />
        )}

        {section === 'others' && (
          <InfiniteScroll 
            queryKey={['/api/movies/discover']}
            fetchFn={(page) => fetchAllMovies(page)}
            title="Other Movies"
          />
        )}
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
};

export default Home;