import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import BlogCard from "@/components/BlogCard";
import FeaturedBlog from "@/components/FeaturedBlog";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import apiFetch from "../utils/api";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/blogs", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const blogs = await response.json();
        console.log("Fetched blogs:", blogs);

        const formattedBlogs = blogs.map(blog => ({
          id: blog.id,
          title: blog.title,
          // Take first 100 characters, preserving line breaks
          excerpt: blog.content.length > 100
            ? blog.content.substring(0, 100) + "..."
            : blog.content,
          imageUrl: blog.image
            ? `data:image/jpeg;base64,${blog.image}`
            : "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
          authorName: blog.authorEmail ? blog.authorEmail.split("@")[0] : "Unknown",
          date: new Date(blog.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).toUpperCase(),
        }));

        setAllBlogs(formattedBlogs);
        setDisplayedBlogs(formattedBlogs.slice(0, 5)); // Limit to 5 blogs initially
        if (formattedBlogs.length > 0) {
          setFeaturedBlog(formattedBlogs[0]);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.toLowerCase().trim();

    if (query) {
      setIsSearching(true);
      const filtered = allBlogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt.toLowerCase().includes(query)
      );
      setDisplayedBlogs(filtered.slice(0, 5)); // Limit to 5 blogs for search results
    } else {
      setIsSearching(false);
      setDisplayedBlogs(allBlogs.slice(0, 5)); // Limit to 5 blogs when clearing search
    }
  };

  if (loading) {
    return <div className="pt-20 min-h-screen bg-black text-white text-center">Loading...</div>;
  }

  return (
    <div className="pt-20 bg-black min-h-screen">
      <Hero />

      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[rgba(229,228,226,0.5)]" />
            </div>
            <input
              type="text"
              placeholder="Search blogs by title or content..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-4 pl-12 bg-black border-4 border-white placeholder-[rgba(229,228,226,0.5)] text-white outline-none transition-brutal focus:border-[rgba(229,228,226,0.8)]"
            />
          </div>
        </div>

        {/* Featured */}
        {!isSearching && featuredBlog && (
          <>
            <h2 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
              FEATURED BLOG
            </h2>
            <FeaturedBlog {...featuredBlog} />
          </>
        )}

        {/* Latest Posts or Search Results */}
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
            {isSearching ? "SEARCH RESULTS" : "LATEST POSTS"}
          </h2>

          {displayedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-12">
              {displayedBlogs.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>
          ) : (
            <div className="border-4 border-white p-12 text-center">
              <p className="text-xl text-[rgba(229,228,226,0.8)]">
                {isSearching
                  ? `No blogs found for "${searchQuery}". Try a different search term.`
                  : "No blogs available yet."}
              </p>
            </div>
          )}

          {/* Explore All Button */}
          <div className="mt-12 text-center">
            <Link to="/blogs">
              <Button className="font-['Space_Grotesk'] font-bold py-6 px-8">
                EXPLORE ALL
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
