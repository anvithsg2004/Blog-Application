import React from "react";
import BlogCard from '../BlogCard';

const AllBlogs = () => {
    // Mock blogs data - replace with actual data fetching
    const blogs = [
        {
            id: "1",
            title: "Monochromatic Design Systems: Less Is More",
            excerpt: "Why limiting your color palette can lead to more coherent, impactful designs that stand the test of time and strengthen brand identity.",
            imageUrl: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
            authorName: "Sarah Johnson",
            date: "APR 23, 2025",
        },
        {
            id: "2",
            title: "Typography as Architecture: Building with Fonts",
            excerpt: "How thoughtful typography choices serve as the structural foundation of your design, creating hierarchy, flow, and visual impact.",
            imageUrl: "https://images.pexels.com/photos/3585090/pexels-photo-3585090.jpeg",
            authorName: "David Chen",
            date: "APR 20, 2025",
        },
        {
            id: "3",
            title: "Neuomorphic UIs: The Evolution of Skeuomorphism",
            excerpt: "Exploring how neuomorphic design brings subtle dimension to flat interfaces, creating a tactile experience in digital environments.",
            imageUrl: "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg",
            authorName: "Michelle Park",
            date: "APR 18, 2025",
        },
    ];

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