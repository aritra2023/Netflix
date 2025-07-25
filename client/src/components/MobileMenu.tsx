import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Genre {
  id: number;
  name: string;
}

const MobileMenu = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showConnect, setShowConnect] = useState(false);

  const { data: genres = [] as Genre[] } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowGenres(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setShowGenres(false);
  };

  // Close menu when location changes
  useEffect(() => {
    closeMenu();
  }, [location]);

  // Add event listener for the toggle-mobile-menu event
  useEffect(() => {
    const handleToggleMenu = () => toggleMenu();
    document.addEventListener('toggle-mobile-menu', handleToggleMenu);

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.querySelector('.mobile-menu');
      if (isOpen && mobileMenu && !mobileMenu.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('toggle-mobile-menu', handleToggleMenu);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  return (
    <div 
      className={`mobile-menu fixed top-0 left-0 w-64 h-full bg-netflix-dark z-50 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out shadow-lg`}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <span className="text-netflix-red font-bold text-xl">404</span>
            <span className="text-netflix-red mx-1 font-bold">|</span>
            <span className="text-white font-semibold">MOVIE</span>
          </div>
          <button onClick={closeMenu} className="text-white focus:outline-none">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <nav className="space-y-5">
          <a 
            href="/" 
            className="block text-white hover:text-netflix-red transition-colors"
            onClick={(e) => {
              if (location === '/') {
                e.preventDefault();
                closeMenu();
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }
            }}
          >
            Home
          </a>

          {/* Genres Navigation */}
          <div>
            <button
              className="w-full flex items-center justify-between text-white hover:text-netflix-red transition-colors"
              onClick={() => setShowGenres(!showGenres)}
            >
              <span>Genres</span>
              <i className={`fas fa-chevron-${showGenres ? 'up' : 'down'} text-sm`}></i>
            </button>

            <div className={cn(
              "pl-4 space-y-3 overflow-hidden transition-all duration-300",
              showGenres ? "max-h-[500px] mt-3" : "max-h-0"
            )}>
              {genres.map((genre: Genre) => (
                <Link 
                  key={genre.id} 
                  href={`/genre/${genre.id}`} 
                  className="block text-white hover:text-netflix-red transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>

          <a 
            href="https://t.me/movies404update"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-white hover:text-netflix-red transition-colors"
            onClick={closeMenu}
          >
            Telegram
          </a>
          {/* Connect Navigation */}
          <div>
            <button
              className="w-full flex items-center justify-between text-white hover:text-netflix-red transition-colors"
              onClick={() => setShowConnect(!showConnect)}
            >
              <span>Connect</span>
              <i className={`fas fa-chevron-${showConnect ? 'up' : 'down'} text-sm`}></i>
            </button>

            <div className={cn(
              "pl-4 space-y-3 overflow-hidden transition-all duration-200 ease-in-out will-change-transform",
              showConnect ? "max-h-[500px] mt-3 opacity-100" : "max-h-0 opacity-0"
            )}>
              <a 
                href="https://t.me/+71hUV_NhjIlkN2U1"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white hover:text-netflix-red transition-colors"
                onClick={closeMenu}
              >
                Request
              </a>
              <a 
                href="https://t.me/+71hUV_NhjIlkN2U1"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white hover:text-netflix-red transition-colors"
                onClick={closeMenu}
              >
                Customer Support
              </a>
              <a 
                href="/download"
                className="block text-white hover:text-netflix-red transition-colors"
                onClick={closeMenu}
              >
                How to Download
              </a>
              <a 
                href="/about"
                className="block text-white hover:text-netflix-red transition-colors"
                onClick={closeMenu}
              >
                About Us
              </a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;