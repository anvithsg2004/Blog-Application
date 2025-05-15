import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiFetch from "../utils/api";

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await apiFetch("/api/blogs", {
                    method: "GET",
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch blogs");
                }
                const data = await response.json();
                const formattedBlogs = data.map(blog => ({
                    id: blog.id,
                    title: blog.title,
                    excerpt: blog.content.substring(0, 150) + "...",
                    imageUrl: blog.image ? `data:image/jpeg;base64,${blog.image}` : null,
                    authorName: blog.authorEmail, // Will be updated later
                    date: new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }).toUpperCase(),
                }));
                setBlogs(formattedBlogs);
                setFilteredBlogs(formattedBlogs);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredBlogs(blogs);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredBlogs(
                blogs.filter(
                    (blog) =>
                        blog.title.toLowerCase().includes(query) ||
                        blog.authorName.toLowerCase().includes(query)
                )
            );
        }
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, blogs]);

    // Calculate paginated blogs
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    };

    if (loading) {
        return (
            <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/60 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-black">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-12">
                    ALL BLOGS
                </h1>
                <div className="mb-12">
                    <input
                        type="text"
                        placeholder="SEARCH BLOGS BY TITLE OR AUTHOR..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none inset-shadow transition-brutal focus:border-white uppercase text-xs tracking-[1px]"
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                    {currentBlogs.map((blog) => (
                        <Link key={blog.id} to={`/blog/${blog.id}`} className="block transition-brutal">
                            <div className="border border-[rgba(229,228,226,0.3)] overflow-hidden">
                                <div className="aspect-[16/9] overflow-hidden">
                                    <img
                                        src={blog.imageUrl || "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg"}
                                        alt={blog.title || "Blog image"}
                                        className="w-full h-full object-cover opacity-80 transition-all duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] hover:opacity-100 hover:scale-105"
                                        onError={(e) => {
                                            e.target.src = "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg";
                                            console.error(`Failed to load blog image for blog ID: ${blog.id}`);
                                        }}
                                    />
                                </div>
                                <div className="p-6 bg-black">
                                    <h2 className="text-xl md:text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white">
                                        {blog.title || "Untitled"}
                                    </h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-black border border-[rgba(229,228,226,0.5)] text-white uppercase text-xs tracking-[1px] transition-brutal hover:bg-[rgba(229,228,226,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            PREVIOUS
                        </button>
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 border border-[rgba(229,228,226,0.5)] text-white uppercase text-xs tracking-[1px] transition-brutal ${currentPage === index + 1
                                        ? "bg-white text-black"
                                        : "bg-black hover:bg-[rgba(229,228,226,0.1)]"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-black border border-[rgba(229,228,226,0.5)] text-white uppercase text-xs tracking-[1px] transition-brutal hover:bg-[rgba(229,228,226,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            NEXT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllBlogs;