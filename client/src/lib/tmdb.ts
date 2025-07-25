// TMDB Image URLs
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes
export const POSTER_SIZES = {
  xs: 'w92',
  sm: 'w154',
  md: 'w185',
  lg: 'w342',
  xl: 'w500',
  xxl: 'w780',
  original: 'original'
};

export const BACKDROP_SIZES = {
  sm: 'w300',
  md: 'w780',
  lg: 'w1280',
  original: 'original'
};

export const PROFILE_SIZES = {
  xs: 'w45',
  sm: 'w185',
  md: 'h632',
  original: 'original'
};

// Build image URLs
export const getPosterUrl = (path: string | null, size = POSTER_SIZES.lg) => {
  if (!path) return 'https://i.postimg.cc/J4r3v6bf/20250524-2103-Minimalist-Movie-Poster-simple-compose-01jw1ests4ezbv62j9s1eb7y3b.png';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size = BACKDROP_SIZES.lg) => {
  if (!path) return '/clapper-board-dark.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getProfileUrl = (path: string | null, size = PROFILE_SIZES.sm) => {
  if (!path) return '/clapper-board-dark.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Format movie runtime to hours and minutes
export const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Format release year from date
export const getYearFromDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear().toString();
};