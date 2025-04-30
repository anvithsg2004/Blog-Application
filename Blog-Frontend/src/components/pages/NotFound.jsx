import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-lg border-4 border-white p-12 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">404</h1>
        <div className="h-1 w-20 bg-gray-300 mx-auto mb-6"></div>
        <p className="text-xl text-gray-300 mb-8">This page doesn't exist or has been moved.</p>
        <Link to="/" className="bg-white text-black hover:bg-gray-200 px-4 py-2 inline-flex items-center">
          ← RETURN HOME
        </Link>
      </div>
    </div>
  );
};

export default NotFound;