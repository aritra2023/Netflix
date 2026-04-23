import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useRef } from 'react';
import { fetchMovieById } from '@/lib/api';
import { getPosterUrl } from '@/lib/tmdb';
import { getYearFromDate, formatRuntime } from '@/lib/utils';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import Footer from "@/components/Footer";

type Server = {
  name: string;
  build: (tmdbId: string) => string;
};

const SERVERS: Server[] = [
  { name: 'Server 1 - VidSrc',     build: (tmdb) => `https://vidsrc.to/embed/movie/${tmdb}` },
  { name: 'Server 2 - VidSrc CC',  build: (tmdb) => `https://vidsrc.cc/v2/embed/movie/${tmdb}` },
  { name: 'Server 3 - 2Embed',     build: (tmdb) => `https://www.2embed.cc/embed/${tmdb}` },
  { name: 'Server 4 - MultiEmbed', build: (tmdb) => `https://multiembed.mov/?video_id=${tmdb}&tmdb=1` },
  { name: 'Server 5 - Embed.su',   build: (tmdb) => `https://embed.su/embed/movie/${tmdb}` },
  { name: 'Server 6 - MoviesAPI',  build: (tmdb) => `https://moviesapi.club/movie/${tmdb}` },
];

const RACE_TIMEOUT = 8000;

const VideoPlayerPage = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [racing, setRacing] = useState(true);
  const [pings, setPings] = useState<(number | null)[]>(() => SERVERS.map(() => null));
  const raceContainerRef = useRef<HTMLDivElement>(null);

  const { data: movie, isLoading } = useQuery({
    queryKey: [`/api/movies/${movieId}`],
    queryFn: () => fetchMovieById(movieId),
    staleTime: 0,
  });

  // Race all servers on mount / movie change to find the fastest one
  useEffect(() => {
    if (!movieId) return;
    setRacing(true);
    setActiveIdx(null);
    setPings(SERVERS.map(() => null));

    const container = raceContainerRef.current;
    if (!container) return;
    container.innerHTML = '';

    let winnerPicked = false;
    const startedAt = performance.now();
    const frames: HTMLIFrameElement[] = [];
    const timers: number[] = [];

    SERVERS.forEach((s, idx) => {
      const f = document.createElement('iframe');
      f.src = s.build(movieId);
      f.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;';
      f.setAttribute('aria-hidden', 'true');
      f.onload = () => {
        const ping = Math.round(performance.now() - startedAt);
        setPings(prev => {
          const next = [...prev];
          if (next[idx] == null) next[idx] = ping;
          return next;
        });
        if (!winnerPicked) {
          winnerPicked = true;
          setActiveIdx(idx);
          setRacing(false);
          setIframeKey(k => k + 1);
        }
      };
      frames.push(f);
      container.appendChild(f);
    });

    // Hard fallback: if nothing fires onload, just pick server 1
    const fallback = window.setTimeout(() => {
      if (!winnerPicked) {
        winnerPicked = true;
        setActiveIdx(0);
        setRacing(false);
        setIframeKey(k => k + 1);
      }
    }, RACE_TIMEOUT);
    timers.push(fallback);

    return () => {
      timers.forEach(t => clearTimeout(t));
      frames.forEach(f => { f.onload = null; f.src = 'about:blank'; });
      if (container) container.innerHTML = '';
    };
  }, [movieId]);

  const currentSrc = useMemo(
    () => (activeIdx != null ? SERVERS[activeIdx].build(movieId || '') : ''),
    [activeIdx, movieId]
  );

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setRacing(false);
    setIframeKey(k => k + 1);
  };

  const handleRetry = () => setIframeKey(k => k + 1);

  return (
    <div className="min-h-screen bg-black">
      {/* Hidden race container */}
      <div ref={raceContainerRef} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden />

      {/* Top Ad Slot */}
      <div className="w-full h-[90px] bg-netflix-gray flex items-center justify-center">
        <span className="text-gray-400">Advertisement</span>
      </div>

      {/* Video Player */}
      <div className="relative w-full h-56 md:h-[calc(100vh-340px)] bg-black">
        {currentSrc && (
          <iframe
            key={iframeKey}
            src={currentSrc}
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            data-testid="iframe-player"
          />
        )}
        {racing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-white/15 border-t-[#E50914] animate-spin" />
            <div className="text-sm opacity-80">Finding fastest server…</div>
          </div>
        )}
      </div>

      {/* Server Switcher */}
      <div className="bg-netflix-black/95 border-t border-gray-800 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <i className="fas fa-server text-[#E50914]"></i>
              <span>Active:</span>
              <strong className="text-white" data-testid="text-active-server">
                {activeIdx != null ? SERVERS[activeIdx].name : 'Detecting…'}
              </strong>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SERVERS.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => handleSelect(i)}
                  data-testid={`button-server-${i + 1}`}
                  className={
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition border ' +
                    (i === activeIdx
                      ? 'bg-[#E50914] text-white border-[#E50914] shadow-[0_4px_14px_rgba(229,9,20,0.35)]'
                      : 'bg-netflix-gray/40 text-gray-200 border-gray-700 hover:border-[#E50914] hover:text-white')
                  }
                  title={s.name}
                >
                  Server {i + 1}
                  {pings[i] != null && (
                    <span className="ml-1 opacity-70">{pings[i]}ms</span>
                  )}
                </button>
              ))}
              <button
                onClick={handleRetry}
                data-testid="button-retry"
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-netflix-gray/40 text-gray-200 border border-gray-700 hover:border-white hover:text-white transition"
              >
                <i className="fas fa-rotate-right mr-1"></i> Retry
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Fastest server auto-select hota hai. Manually bhi switch kar sakte hain.
          </p>
        </div>
      </div>

      {/* Bottom Ad Slot */}
      <div className="w-full h-[90px] bg-netflix-gray flex items-center justify-center">
        <span className="text-gray-400">Advertisement</span>
      </div>

      {/* Movie Info Section */}
      {movie && (
        <div className="bg-netflix-black/90 p-4 border-t border-gray-800">
          <div className="container mx-auto">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-3" data-testid="text-movie-title">{movie.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                <span>{getYearFromDate(movie.release_date)}</span>
                {movie.runtime && (
                  <>
                    <span>•</span>
                    <span>{formatRuntime(movie.runtime)}</span>
                  </>
                )}
                <span>•</span>
                <span className="bg-[#E50914] text-white px-2 py-1 rounded-sm">
                  {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : movie.vote_average}
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-white text-xl font-semibold mb-2">Overview</h3>
                <p className="text-gray-300">{movie.overview}</p>
              </div>
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white text-xl font-semibold mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map(genre => (
                      <span key={genre.id} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Movies Section */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Similar Movies</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <MovieCardSkeleton key={i} />
                    ))}
                  </div>
                ) : movie?.similar?.results?.length > 0 || movie?.recommendations?.results?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {(movie?.similar?.results?.length > 0 ? movie.similar.results : movie.recommendations.results).slice(0, 12).map((similarMovie: any) => (
                      <a
                        href={`/watch/${similarMovie.id}`}
                        key={similarMovie.id}
                        className="bg-netflix-gray/20 rounded-lg overflow-hidden group relative block"
                      >
                        <div className="relative aspect-[2/3]">
                          <img
                            src={getPosterUrl(similarMovie.poster_path)}
                            alt={similarMovie.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-netflix-red hover:bg-netflix-red/80 text-white rounded-full w-12 h-12 flex items-center justify-center">
                              <i className="fas fa-play"></i>
                            </span>
                          </div>
                        </div>
                        <div className="p-2">
                          <h3 className="text-white text-sm font-medium truncate">{similarMovie.title}</h3>
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                            <span>{getYearFromDate(similarMovie.release_date)}</span>
                            <span className="bg-[#E50914] text-white px-1.5 py-0.5 rounded">
                              {similarMovie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No similar movies found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default VideoPlayerPage;
