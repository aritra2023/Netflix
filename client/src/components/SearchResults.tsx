import { Link } from 'wouter';
import { getPosterUrl, getYearFromDate } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface SearchResultsProps {
  results: Movie[];
  isLoading: boolean;
  query: string;
  onResultClick: () => void;
}

const SearchResults = ({ results, isLoading, query, onResultClick }: SearchResultsProps) => {
  return (
    <div id="search-results" className="fixed top-16 left-0 right-0 bg-netflix-dark bg-opacity-95 backdrop-blur z-40 animate-fadeIn shadow-lg">
      <div className="container mx-auto px-4 py-4 search-results">
        <h3 className="text-white text-lg mb-4">
          {isLoading ? 'Searching...' : `Search Results for "${query}"`}
        </h3>
        <div>
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center py-8">
              <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          )}
          
          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(movie => (
                <Link 
                  key={movie.id} 
                  href={`/movie/${movie.id}`} 
                  onClick={onResultClick}
                  className="movie-result flex bg-netflix-gray rounded overflow-hidden hover:bg-opacity-80 transition-colors"
                >
                  <img 
                    src={getPosterUrl(movie.poster_path, 'w92')} 
                    alt={`${movie.title} poster`} 
                    className="w-16 h-auto object-cover"
                  />
                  <div className="p-2 flex flex-col justify-center">
                    <h4 className="text-white text-sm font-medium truncate">{movie.title}</h4>
                    <p className="text-gray-400 text-xs">{getYearFromDate(movie.release_date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* No results */}
          {!isLoading && results.length === 0 && (
            <div className="flex flex-col items-center py-8">
              <i className="fas fa-search text-4xl text-gray-500 mb-3"></i>
              <p className="text-gray-400 mb-1">No movies found</p>
              <p className="text-gray-500 text-sm">Try different keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
