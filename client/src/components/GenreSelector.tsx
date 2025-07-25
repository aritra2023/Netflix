import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { fetchGenres } from '@/lib/api';

interface Genre {
  id: number;
  name: string;
}

// Map of genre IDs to Font Awesome icons
const genreIcons: Record<string, string> = {
  '28': 'fa-film', // Action
  '35': 'fa-laugh', // Comedy
  '18': 'fa-theater-masks', // Drama
  '27': 'fa-ghost', // Horror
  '878': 'fa-rocket', // Science Fiction
  '10749': 'fa-heart', // Romance
  '12': 'fa-dragon', // Adventure
  '16': 'fa-child', // Animation
  '80': 'fa-user-secret', // Crime
  '99': 'fa-camera', // Documentary
  '10751': 'fa-users', // Family
  '14': 'fa-hat-wizard', // Fantasy
  '36': 'fa-landmark', // History
  '10402': 'fa-music', // Music
  '9648': 'fa-search', // Mystery
  '10752': 'fa-fighter-jet', // War
  '37': 'fa-hat-cowboy', // Western
};

const GenreSelector = () => {
  const { data: genres = [] as Genre[], isLoading } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <h2 className="text-white text-2xl font-bold mb-4">Browse by Genre</h2>
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="genres-section" className="mb-10 pt-5">
      <h2 className="text-white text-2xl font-bold mb-4">Browse by Genre</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((genre: Genre) => (
          <Link 
            key={genre.id} 
            href={`/genre/${genre.id}`}
            className="bg-netflix-gray hover:bg-netflix-red transition-colors duration-300 rounded-lg p-4 text-center"
          >
            <i className={`fas ${genreIcons[genre.id] || 'fa-film'} mb-2 text-2xl`}></i>
            <p className="text-white font-medium">{genre.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default GenreSelector;
