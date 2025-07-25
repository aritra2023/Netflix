import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieById, fetchMovieCredits, fetchSimilarMovies, addToWatchHistory } from '@/lib/api';
import { getPosterUrl, getBackdropUrl, getProfileUrl, formatRuntime, getYearFromDate } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import { useToast } from '@/hooks/use-toast';

interface MovieDetailsProps {
  movieId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MovieDetails = ({ movieId, isOpen, onClose }: MovieDetailsProps) => {
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Fetch movie details
  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: [`/api/movies/${movieId}`],
    queryFn: () => fetchMovieById(movieId),
    enabled: isOpen,
  });

  // Fetch movie credits
  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    queryKey: [`/api/movies/${movieId}/credits`],
    queryFn: () => fetchMovieCredits(movieId),
    enabled: isOpen,
  });

  // Fetch similar movies
  const { data: similarMovies, isLoading: isLoadingSimilar } = useQuery({
    queryKey: [`/api/movies/${movieId}/similar`],
    queryFn: () => fetchSimilarMovies(movieId),
    enabled: isOpen,
  });

  // Handle body overflow when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVideoOpen(false); //Added to close the video player on modal close.
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleWatchClick = () => {
    if (!movie) return;
    setIsVideoOpen(true);
    
    toast({
      title: "Opening Video Player",
      description: `Watch "${movie.title}" in HD quality`,
    });
  };

  if (!isOpen) return null;

  const isLoading = isLoadingMovie || isLoadingCredits || isLoadingSimilar;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-white text-xl hover:text-netflix-red transition"
        >
          <i className="fas fa-times"></i>
        </button>

        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : movie ? (
          <div className="relative mt-10 pb-20">
            {/* Movie Backdrop */}
            <div className="relative rounded-lg overflow-hidden mb-8" style={{ height: '40vh', minHeight: '300px' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
              <img 
                src={getBackdropUrl(movie.backdrop_path, 'w1280')} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Movie Info */}
            <div className="flex flex-col md:flex-row -mt-20 relative z-20">
              <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0 flex-shrink-0">
                <img 
                  src={getPosterUrl(movie.poster_path, 'w500')} 
                  alt={movie.title} 
                  className="rounded-lg shadow-lg max-w-full md:max-w-xs mx-auto"
                />
              </div>
              <div className="md:w-2/3 lg:w-3/4 md:pl-8">
                <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-gray-300">{getYearFromDate(movie.release_date)}</span>
                  {movie.runtime && <span className="text-gray-300">• {formatRuntime(movie.runtime)}</span>}
                  <span className="bg-netflix-red text-white px-2 py-0.5 text-xs rounded">
                    {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : movie.vote_average}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-white text-xl font-semibold mb-2">Overview</h3>
                  <p className="text-gray-300">{movie.overview}</p>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map(genre => (
                        <span key={genre.id} className="bg-netflix-gray text-white px-3 py-1 rounded-full text-sm">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    className="bg-netflix-red hover:bg-opacity-80 text-white py-2 px-5 rounded flex items-center transition"
                    onClick={handleWatchClick}
                  >
                    <i className="fas fa-play mr-2"></i> Watch
                  </button>
                </div>
              </div>
            </div>

            {/* Cast */}
            {credits && credits.cast && credits.cast.length > 0 && (
              <div className="mt-10">
                <h3 className="text-white text-2xl font-bold mb-4">Cast</h3>
                <div className="cast-scroll flex gap-4 pb-4">
                  {credits.cast.slice(0, 10).map(person => (
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

            {/* Similar Movies */}
            {similarMovies && similarMovies.results && similarMovies.results.length > 0 && (
              <div className="mt-10">
                <h3 className="text-white text-2xl font-bold mb-4">Similar Movies</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {similarMovies.results.slice(0, 5).map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onWatchClick={handleWatchClick}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Video Player Modal */}
            {isVideoOpen && movie && (
              <VideoPlayer movieId={movie.id} isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
            <i className="fas fa-exclamation-triangle text-netflix-red text-5xl mb-4"></i>
            <h2 className="text-white text-2xl font-bold mb-2">Movie Not Found</h2>
            <p className="text-gray-400">We couldn't find the movie you're looking for.</p>
            <button 
              onClick={handleClose}
              className="mt-6 bg-netflix-red hover:bg-opacity-80 text-white py-2 px-5 rounded transition"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoPlayer = ({movie, onClose}: {movie: any, onClose: () => void}) => { // Placeholder VideoPlayer component
  //  Replace this with your actual video player implementation using the movie data.  Consider using a library like React Player.
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <button onClick={onClose} className="absolute top-2 right-2">X</button>
      <h1>{movie?.title}</h1>
      <p>Replace this with your video player</p>
    </div>
  );
}

export default MovieDetails;