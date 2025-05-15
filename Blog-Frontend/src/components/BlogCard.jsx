import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const BlogCard = ({ id, title, excerpt, imageUrl, authorName, date }) => {
  // Parse and sanitize excerpt as Markdown
  const markdownExcerpt = marked(excerpt || "No excerpt available");
  const sanitizedExcerpt = DOMPurify.sanitize(markdownExcerpt);

  return (
    <article className="transition-brutal overflow-hidden">
      <div className="grid grid-cols-12 gap-0">
        {/* Image Section */}
        <div className="col-span-12 bg-black border border-[rgba(229,228,226,0.3)] relative overflow-hidden md:col-span-7">
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={imageUrl}
              alt={title || "Blog image"}
              className="w-full h-full object-cover opacity-80 transition-all duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] hover:opacity-100 hover:scale-105"
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg";
                console.error(`Failed to load blog image for blog ID: ${id}`);
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="col-span-12 bg-black border border-[rgba(229,228,226,0.3)] border-t-0 md:border-t md:border-l-0 p-6 md:p-8 flex flex-col relative md:col-span-5">
          <div className="uppercase text-xs leading-tight tracking-[1px] text-[rgba(229,228,226,0.6)] mb-2">
            {date && <span className="mr-4">{date}</span>}
            {authorName && <span>{authorName}</span>}
          </div>

          <h2 className="text-xl md:text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-4">
            {title || "Untitled"}
          </h2>

          <div
            className="text-lg leading-[160%] text-white/85 mb-6 flex-1 markdown-content"
            dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
          />

          <Link
            to={`/blog/${id}`}
            className="uppercase text-xs leading-tight tracking-[1px] text-[#E5E4E2] flex items-center transition-brutal hover:text-white group"
          >
            READ MORE
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:translate-x-1" />
          </Link>
        </div>
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
    </article>
  );
};

export default BlogCard;