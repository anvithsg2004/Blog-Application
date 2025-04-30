import React from "react";
import Hero from "@/components/Hero";
import BlogCard from "@/components/BlogCard";
import FeaturedBlog from "@/components/FeaturedBlog";

const Home = () => {
  // Dummy data for featured and latest blogs
  const featuredBlog = {
    id: "featured-1",
    title: "The Future of Brutalist Design in Digital Spaces",
    excerpt:
      "Exploring how the raw, honest aesthetic of brutalist architecture is transforming digital spaces and creating memorable user experiences focused on content.",
    imageUrl: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
    authorName: "Alex Mitchel",
    date: "APR 25, 2025",
  };

  const blogs = [
    {
      id: "1",
      title: "Monochromatic Design Systems: Less Is More",
      excerpt:
        "Why limiting your color palette can lead to more coherent, impactful designs that stand the test of time and strengthen brand identity.",
      imageUrl: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
      authorName: "Sarah Johnson",
      date: "APR 23, 2025",
    },
    {
      id: "2",
      title: "Typography as Architecture: Building with Fonts",
      excerpt:
        "How thoughtful typography choices serve as the structural foundation of your design, creating hierarchy, flow, and visual impact.",
      imageUrl: "https://images.pexels.com/photos/3585090/pexels-photo-3585090.jpeg",
      authorName: "David Chen",
      date: "APR 20, 2025",
    },
    {
      id: "3",
      title: "Neuomorphic UIs: The Evolution of Skeuomorphism",
      excerpt:
        "Exploring how neuomorphic design brings subtle dimension to flat interfaces, creating a tactile experience in digital environments.",
      imageUrl: "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg",
      authorName: "Michelle Park",
      date: "APR 18, 2025",
    },
    {
      id: "4",
      title: "Asymmetric Layouts: Creating Visual Tension",
      excerpt:
        "How breaking the grid can lead to more engaging interfaces that guide users through content in unexpected but meaningful ways.",
      imageUrl: "https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg",
      authorName: "Thomas Wright",
      date: "APR 15, 2025",
    },
  ];

  return (
    <div className="pt-20 bg-black min-h-screen">
      <Hero />

      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Featured */}
        <h2 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
          FEATURED BLOG
        </h2>
        <FeaturedBlog {...featuredBlog} />

        {/* Latest Posts */}
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
            LATEST POSTS
          </h2>
          <div className="grid grid-cols-1 gap-12">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;