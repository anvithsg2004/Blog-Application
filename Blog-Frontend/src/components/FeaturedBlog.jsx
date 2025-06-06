import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import DOMPurify from "dompurify";

const FeaturedBlog = ({ id, title, excerpt, imageUrl, authorName, date }) => {
  // Parse and sanitize excerpt as Markdown
  const markdownExcerpt = marked(excerpt || "No excerpt available");
  const sanitizedExcerpt = DOMPurify.sanitize(markdownExcerpt);

  return (
    <div
      className="mb-16 grid grid-cols-12 gap-0 border-4 border-white brutal-shadow"
    >
      <div
        className="relative col-span-12 lg:col-span-8 overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={title || "Featured blog image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg";
            console.error(`Failed to load featured blog image for blog ID: ${id}`);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="uppercase text-xs leading-tight tracking-[1px] text-[rgba(229,228,226,0.8)] mb-2">
            {date && <span className="mr-4">{date}</span>}
            {authorName && <span>{authorName}</span>}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl leading-tight font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4">
            {title || "Untitled"}
          </h2>
        </div>
      </div>

      <div
        className="col-span-12 lg:col-span-4 bg-black p-8 flex flex-col"
      >
        <div className="uppercase text-xs leading-tight tracking-[1px] text-[#E5E4E2] mb-4">
          FEATURED
        </div>
        <div
          className="text-lg leading-[160%] text-white/85 mb-6 flex-grow markdown-content"
          dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
        />
        <Link to={`/blog/${id}`}>
          <Button className="w-full flex items-center justify-center font-['Space_Grotesk'] font-bold py-6 group">
            READ ARTICLE
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <style jsx>{`
        .markdown-content :where(p, ul, ol, li) {
          margin: 0.5rem 0;
          color: rgba(255, 255, 255, 0.85);
        }
        .markdown-content strong {
          font-weight: bold;
          color: white;
        }
        .markdown-content em {
          font-style: italic;
        }
        .markdown-content code {
          background: rgba(229, 228, 226, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default FeaturedBlog;