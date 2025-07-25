import { useLocation } from 'wouter';
import React from "react";
import Footer from "@/components/Footer";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-netflix-red text-6xl font-bold">404</span>
        </div>
        <h1 className="text-white text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-netflix-red hover:bg-opacity-80 text-white py-2 px-6 rounded transition"
        >
          Back to Home
        </button>
      </div>
      <Footer />
    </div>
  );
}