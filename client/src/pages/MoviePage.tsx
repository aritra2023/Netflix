import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from '@/components/VideoPlayer';
import { Skeleton } from "@/components/ui/skeleton";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import Header from '@/components/Header';
import MobileMenu from '@/components/MobileMenu';
import BackToTop from '@/components/BackToTop';
import { fetchMovieById, fetchMovieCredits, fetchSimilarMovies, addToWatchHistory, getStreamingUrl } from '@/lib/api';
import { getPosterUrl, getBackdropUrl, getProfileUrl, formatRuntime, getYearFromDate } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { useToast } from '@/hooks/use-toast';
import Footer from "@/components/Footer";

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch movie details
  const { data: movie, isLoading: isLoadingMovie, error: movieError } = useQuery({
    queryKey: [`/api/movies/${id}`],
    queryFn: () => fetchMovieById(id),
  });

  // Fetch movie credits
  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    queryKey: [`/api/movies/${id}/credits`],
    queryFn: () => fetchMovieCredits(id),
    enabled: !!movie,
  });

  // Fetch similar movies
  const { data: similarMovies, isLoading: isLoadingSimilar } = useQuery({
    queryKey: [`/api/movies/${id}/similar`],
    queryFn: () => fetchSimilarMovies(id),
    enabled: !!movie,
  });

  const isLoading = isLoadingMovie || isLoadingCredits || isLoadingSimilar;

  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleWatchClick = (movieId: number) => {
    addToWatchHistory(movieId).catch(console.error);
    window.location.href = `/watch/${movie?.imdb_id || movieId}`;
  };

  if (movieError) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Header />
        <MobileMenu />
        <main className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <i className="fas fa-exclamation-triangle text-netflix-red text-5xl mb-4"></i>
            <h1 className="text-white text-2xl font-bold mb-4">Movie Not Found</h1>
            <p className="text-gray-400 mb-8">We couldn't find the movie you're looking for.</p>
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

      <main className="pt-16 pb-16">
        {isLoading ? (
          <div style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="w-full h-[350px] mb-8">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 lg:w-1/4">
                  <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                </div>
                <div className="md:w-2/3 lg:w-3/4">
                  <Skeleton className="h-8 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-1/3 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        ) : movie ? (
          <div>
            {/* Movie Backdrop - SECTION 1 (Only backdrop image) */}
            <div className="w-full h-[350px] mb-0 relative">
              {/* Full-width backdrop */}
              <div className="absolute inset-0">
                <img 
                  src={getBackdropUrl(movie.backdrop_path, 'w1280')} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-netflix-black"></div>
              </div>
            </div>

            {/* Content SECTION 2 (Poster + Details, completely separated from backdrop) */}
            <div className="container mx-auto px-4 mt-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Movie Poster - Left Column */}
                <div className="md:w-1/3 lg:w-1/4">
                  <img 
                    src={getPosterUrl(movie.poster_path, 'w500')} 
                    alt={movie.title} 
                    className="rounded-lg shadow-xl w-full"
                  />
                </div>

                {/* Movie Details - Right Column */}
                <div className="md:w-2/3 lg:w-3/4">
                  <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>

                  <div className="flex flex-wrap items-center mb-6">
                    <span className="text-gray-300 text-sm md:text-base mr-4">{getYearFromDate(movie.release_date)}</span>
                    {movie.runtime && (
                      <>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-300 text-sm md:text-base mr-4">{formatRuntime(movie.runtime)}</span>
                      </>
                    )}
                    <span className="bg-netflix-red text-white px-2 py-1 text-xs rounded">
                      {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : movie.vote_average}
                    </span>
                  </div>

                  {/* Overview */}
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-semibold mb-3">Overview</h3>
                    <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white text-xl font-semibold mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre: {id: number, name: string}) => (
                          <span 
                            key={genre.id} 
                            className="bg-netflix-gray text-white px-3 py-1 rounded-full text-sm"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Watch Button */}
                  <div className="mb-8">
                    <button 
                      className="bg-netflix-red hover:bg-opacity-80 text-white py-3 px-6 rounded flex items-center transition"
                      onClick={() => handleWatchClick(parseInt(id))}
                    >
                      <i className="fas fa-play mr-2"></i> Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Section - SECTION 3 */}
            <div className="container mx-auto px-4 mt-12">
              {credits && credits.cast && credits.cast.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-white text-2xl font-bold mb-4">Cast</h3>
                  <div className="cast-scroll flex gap-4 pb-4 overflow-x-auto">
                    {credits.cast.slice(0, 10).map((person: {id: number, name: string, profile_path: string | null, character: string}) => (
                      <div key={person.id} className="flex-shrink-0 w-32">
                        <img 
                          src={getProfileUrl(person.profile_path)} 
                          alt={`${person.name}`} 
                          className="w-full h-auto rounded-lg mb-2"
                        />
                        <h4 className="text-white text-sm font-medium">{person.name}</h4>
                        <p className="text-gray-400 text-xs">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Movies Section - SECTION 4 */}
              {similarMovies && similarMovies.results && similarMovies.results.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white text-2xl font-bold mb-4">Similar Movies</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {similarMovies.results.slice(0, 10).map((movie: {id: number, title: string, poster_path: string | null, vote_average: number}) => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onWatchClick={handleWatchClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <BackToTop />
      <Footer />
      {isVideoOpen && movie && (
        <VideoPlayer 
          movieId={movie.imdb_id || String(movie.id)} 
          isOpen={isVideoOpen} 
          onClose={() => setIsVideoOpen(false)} 
        />
      )}
    </div>
  );
};

export default MoviePage;