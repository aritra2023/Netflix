import { useState, useEffect } from 'react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolling down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      id="back-to-top" 
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-netflix-red text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-80 transition focus:outline-none z-30 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <i className="fas fa-chevron-up"></i>
    </button>
  );
};

export default BackToTop;
