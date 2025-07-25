import { Link } from 'wouter';
import { getPosterUrl } from '@/lib/tmdb';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
  };
  onWatchClick?: (movieId: number) => void;
}

const MovieCard = ({ movie, onWatchClick }: MovieCardProps) => {
  const { id, title, poster_path, vote_average } = movie;

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/watch/${movie.imdb_id || id}`;
  };

  // Format the vote average to one decimal place
  const rating = typeof vote_average === 'number' 
    ? vote_average.toFixed(1) 
    : Number(vote_average).toFixed(1);

  return (
    <Link href={`/movie/${id}`}>
      <div className="movie-card rounded-lg overflow-hidden bg-netflix-dark relative cursor-pointer">
        <img 
          loading="lazy"
          src={getPosterUrl(poster_path)} 
          alt={`${title} poster`} 
          className="w-full h-auto aspect-[2/3] object-cover"
        />
        <div className="movie-actions absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center space-y-3 opacity-0 transition-opacity">
          <button 
            className="bg-netflix-red text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-80 transition"
            onClick={handleWatchClick}
          >
            <i className="fas fa-play"></i>
          </button>
          <h4 className="text-white font-medium text-center px-2">{title}</h4>
          <div className="flex items-center">
            <span className="bg-netflix-red text-white px-2 py-0.5 text-xs rounded">{rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;