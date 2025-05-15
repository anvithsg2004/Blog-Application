import React, { useState, useEffect } from "react";
import BlogCard from '../BlogCard';
import apiFetch from "../utils/api";

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setBlogs(data.map(blog => ({
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
                })));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

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
                <div className="grid gap-12">
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} {...blog} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllBlogs;
