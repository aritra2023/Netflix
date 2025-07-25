import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { getBackdropUrl, getYearFromDate } from '@/lib/tmdb';
import { getStreamingUrl } from '@/lib/api';

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

interface HeroSectionProps {
  movie: Movie;
  onWatchClick?: (movieId: number) => void;
}

const HeroSection = ({ movie, onWatchClick }: HeroSectionProps) => {
  const [truncatedOverview, setTruncatedOverview] = useState('');
  const [isVideoOpen, setIsVideoOpen] = useState(false); // Added state for video player

  // Truncate the overview text for mobile devices
  useEffect(() => {
    const truncateOverview = () => {
      const maxLength = window.innerWidth < 768 ? 100 : 200;
      if (movie.overview.length > maxLength) {
        setTruncatedOverview(`${movie.overview.substring(0, maxLength)}...`);
      } else {
        setTruncatedOverview(movie.overview);
      }
    };

    truncateOverview();
    window.addEventListener('resize', truncateOverview);

    return () => {
      window.removeEventListener('resize', truncateOverview);
    };
  }, [movie.overview]);

  // Format the vote average to one decimal place
  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : Number(movie.vote_average).toFixed(1);

  const handleWatchClick = () => {
    if (!movie) return;
    window.location.href = `/watch/${movie.imdb_id || movie.id}`;
  };

  return (
    <section className="mb-10">
      <div className="relative rounded-lg overflow-hidden" style={{ height: '50vh', minHeight: '400px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img
          src={getBackdropUrl(movie.backdrop_path, 'w1280')}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 z-20 w-full md:w-2/3">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center mb-3">
            <span className="text-gray-300 mr-3">{getYearFromDate(movie.release_date)}</span>
            <span className="bg-netflix-red text-white px-2 py-0.5 text-xs rounded">{rating}</span>
          </div>
          <p className="text-gray-300 text-sm md:text-base mb-4">
            {truncatedOverview}
          </p>
          <div className="flex space-x-3">
            <button
              className="bg-netflix-red hover:bg-opacity-80 text-white py-2 px-5 rounded flex items-center transition"
              onClick={handleWatchClick}
            >
              <i className="fas fa-play mr-2"></i> Watch
            </button>
            <Link href={`/movie/${movie.id}`}>
              <button className="bg-netflix-gray hover:bg-opacity-80 text-white py-2 px-5 rounded flex items-center transition">
                <i className="fas fa-info-circle mr-2"></i> Details
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* {isVideoOpen && <VideoPlayer movieId={movie.id} isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />} */}
    </section>
  );
};

// const VideoPlayer = ({ movieId, isOpen, onClose }: { movieId: number; isOpen: boolean; onClose: () => void }) => {
//   const [videoUrl, setVideoUrl] = useState('');

//   useEffect(() => {
//     // Replace this with your actual video URL retrieval logic
//     const getVideo = async () => {
//       try {
//         const url = await getStreamingUrl(movieId);
//         setVideoUrl(url);
//       } catch (error) {
//         console.error("Error fetching video URL:", error);
//       }
//     };
//     if (isOpen) {
//       getVideo();
//     }
//   }, [movieId, isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-lg p-4">
//         <button className="absolute top-2 right-2" onClick={onClose}>
//           &times;
//         </button>
//         {videoUrl ? (
//           <video width="640" height="360" controls>
//             <source src={videoUrl} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         ) : (
//           <p>Loading video...</p>
//         )}
//       </div>
//     </div>
//   );
// };


export default HeroSection;