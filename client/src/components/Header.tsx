import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useMobile } from '@/hooks/use-mobile';
import SearchResults from './SearchResults';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/lib/api';

const Header = () => {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showConnectDropdown, setShowConnectDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchMovies(searchTerm),
    enabled: searchTerm.length > 2,
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length > 2) {
      setShowSearchResults(true);
      
      // Small delay to avoid too many requests while typing
      searchTimeoutRef.current = setTimeout(() => {
        // The query will run automatically due to the query key change
      }, 300);
    } else {
      setShowSearchResults(false);
    }
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus the search input when opening
      setTimeout(() => {
        document.getElementById('mobile-search')?.focus();
      }, 100);
    } else {
      // Clear search when closing
      setSearchTerm('');
      setShowSearchResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#search-results') && !target.closest('#desktop-search') && !target.closest('#mobile-search')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close search results when navigating
  useEffect(() => {
    setShowSearchResults(false);
    setIsSearchOpen(false);
    setSearchTerm('');
  }, [location]);

  return (
    <header className="fixed top-0 w-full bg-netflix-black bg-opacity-95 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-netflix-red font-bold text-2xl">404</span>
            <span className="text-netflix-red mx-1 font-bold">|</span>
            <span className="text-white font-semibold text-xl">MOVIE</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <a 
            href="/"
            className="text-white hover:text-netflix-red transition"
            onClick={(e) => {
              // If we're already on the home page, just scroll to top
              if (location === '/') {
                e.preventDefault();
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }
            }}
          >
            Home
          </a>
          <a 
            href="#genres" 
            className="text-white hover:text-netflix-red transition"
            onClick={(e) => {
              e.preventDefault();
              const genresSection = document.getElementById('genres-section');
              if (genresSection) {
                window.scrollTo({
                  top: genresSection.offsetTop - 100,
                  behavior: 'smooth'
                });
              } else {
                window.location.href = '/?section=genres';
              }
            }}
          >
            Genres
          </a>
          <a 
            href="https://t.me/movies404update"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-netflix-red transition"
          >
            Telegram
          </a>
          <div className="relative group">
            <button 
              className="text-white hover:text-netflix-red transition"
            >
              Connect
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-netflix-dark rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a 
                  href="https://t.me/+71hUV_NhjIlkN2U1" 
                  className="block px-4 py-2 text-sm text-white hover:text-[#E50914] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Request
                </a>
                <a 
                  href="https://t.me/+71hUV_NhjIlkN2U1" 
                  className="block px-4 py-2 text-sm text-white hover:text-[#E50914] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Customer Support
                </a>
                <a 
                  href="/download" 
                  className="block px-4 py-2 text-sm text-white hover:text-[#E50914] transition-colors"
                >
                  How to Download
                </a>
                <a 
                  href="/about" 
                  className="block px-4 py-2 text-sm text-white hover:text-[#E50914] transition-colors"
                >
                  About Us
                </a>
              </div>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:block relative w-1/3">
          <input 
            type="text" 
            placeholder="Search movies..." 
            className="w-full bg-netflix-gray text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-netflix-red"
            id="desktop-search"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          <button className="absolute right-3 top-2 text-gray-400">
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Mobile Menu and Search */}
        <div className="flex md:hidden items-center space-x-4">
          <button onClick={toggleMobileSearch} className="text-white focus:outline-none">
            <i className="fas fa-search text-xl"></i>
          </button>
          <button onClick={() => document.dispatchEvent(new CustomEvent('toggle-mobile-menu'))} className="text-white focus:outline-none">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobile && (
        <div className={`w-full bg-netflix-dark bg-opacity-95 animate-fadeIn ${isSearchOpen ? 'block' : 'hidden'}`}>
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search movies..." 
                className="w-full bg-netflix-gray text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-netflix-red"
                id="mobile-search"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <button onClick={toggleMobileSearch} className="absolute right-3 top-2 text-gray-400">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showSearchResults && (
        <SearchResults 
          results={searchResults?.results || []} 
          isLoading={isSearching} 
          query={searchTerm}
          onResultClick={() => setShowSearchResults(false)}
        />
      )}
    </header>
  );
};

export default Header;
