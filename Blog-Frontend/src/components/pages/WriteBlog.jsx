import React, { useState, useEffect, useContext } from "react";
import { ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import apiFetch from "../utils/api";

const WriteBlog = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [blogContent, setBlogContent] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("WriteBlog: User not logged in, redirecting to /login");
      localStorage.setItem("redirectAfterLogin", "/write-blog");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          setPreviewUrl(fileReader.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Title is required",
        description: "Please provide a title for your blog post.",
        variant: "destructive",
      });
      return;
    }

    if (!blogContent) {
      toast({
        title: "Content is required",
        description: "Please write some content for your blog post.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", blogContent);

      if (codeContent.trim()) {
        if (!language) {
          toast({
            title: "Language required",
            description: "Please select a language for your code snippet.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        formData.append("language", language);
        formData.append("code", codeContent);
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await apiFetch("/api/blogs", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Blog created successfully:", data);

      toast({
        title: "Blog submitted successfully!",
        description: "Your blog post has been created.",
        variant: "success",
      });

      setTitle("");
      setBlogContent("");
      setCodeContent("");
      setLanguage("javascript");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsPreview(false);

      navigate("/profile");
    } catch (error) {
      console.error("Failed to create blog:", error);
      let errorMessage = "Failed to create blog post.";
      if (error.message.includes("401")) {
        errorMessage = "Unauthorized. Please log in again.";
        navigate("/login");
      } else if (error.message.includes("413")) {
        errorMessage = "Image too large. Please upload a smaller file.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Parse and sanitize Markdown for preview
  const markdownContent = marked(blogContent || "No content entered");
  const sanitizedContent = DOMPurify.sanitize(markdownContent);

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white">
            CREATE NEW BLOG
          </h1>
          <p className="text-[rgba(229,228,226,0.8)] mt-4 max-w-4xl">
            Share your knowledge, insights and expertise with our community.
            Write about tech, design, or any topic you're passionate about. Use Markdown for formatting (e.g., ## for headings, ** for bold).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl grid gap-8">
          {/* Title Input */}
          <div className="grid gap-2">
            <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">Blog Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-4 border-4 border-white bg-black text-xl font-['Space_Grotesk'] focus:border-[#E5E4E2] outline-none transition-brutal"
              placeholder="Enter a captivating title"
              disabled={loading}
            />
          </div>

          {/* Blog Content */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">
                Blog Content
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
                disabled={loading}
              >
                {isPreview ? "Edit" : "Preview"}
              </Button>
            </div>
            {isPreview ? (
              <div
                className="min-h-[300px] p-6 bg-black border border-[rgba(229,228,226,0.5)] text-lg leading-relaxed markdown-content"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            ) : (
              <textarea
                id="blogContent"
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                className="min-h-[300px] p-6 bg-black border border-[rgba(229,228,226,0.5)] font-['Inter'] text-lg leading-relaxed outline-none inset-shadow transition-brutal"
                placeholder="Start writing your blog post here... Use Markdown for formatting (e.g., ## for headings, ** for bold)"
                disabled={loading}
              />
            )}
          </div>

          {/* Language Selection */}
          <div className="grid gap-2">
            <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">
              Code Language (Optional)
            </label>
            <Select value={language} onValueChange={setLanguage} disabled={loading}>
              <SelectTrigger className="p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none transition-brutal focus:border-white">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-[rgba(229,228,226,0.5)] text-white">
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code Content */}
          <div className="grid gap-2">
            <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">
              Code Snippet (Optional)
            </label>
            <textarea
              id="codeContent"
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="min-h-[200px] p-6 bg-black border border-[rgba(229,228,226,0.5)] font-mono outline-none inset-shadow transition-brutal"
              placeholder="// Add your code snippet here..."
              disabled={loading}
            />
          </div>

          {/* File Upload */}
          <div className="grid gap-4">
            <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">Featured Image</label>
            <div className="flex gap-6 items-start">
              <div className="flex-1">
                <div className="border-2 border-dashed border-[rgba(229,228,226,0.5)] p-6 text-center cursor-pointer hover:border-[#E5E4E2] transition-brutal">
                  <input
                    type="file"
                    id="featured-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="featured-image"
                    className="flex flex-col items-center justify-center py-4 cursor-pointer"
                  >
                    <svg
                      className="h-12 w-12 text-[rgba(229,228,226,0.5)] mb-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[#E5E4E2]">
                      {selectedFile ? selectedFile.name : "Upload an image"}
                    </span>
                    <p className="text-[rgba(229,228,226,0.5)] text-sm mt-1">
                      PNG, JPG or GIF up to 10MB
                    </p>
                  </label>
                </div>
              </div>

              {previewUrl && (
                <div className="w-1/3 border border-[rgba(229,228,226,0.3)]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              className="bg-transparent border border-[rgba(229,228,226,0.5)] text-white py-3 px-6 cursor-pointer flex items-center transition-brutal hover:bg-[rgba(229,228,226,0.1)]"
              onClick={scrollToTop}
              disabled={loading}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Back to Top
            </button>

            <Button
              type="submit"
              className="py-6 px-8 font-['Space_Grotesk'] font-bold"
              disabled={loading}
            >
              {loading ? "PUBLISHING..." : "PUBLISH BLOG"}
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .markdown-content :where(h1, h2, h3, h4, h5, h6) {
          font-family: "Space Grotesk", sans-serif;
          font-weight: bold;
          color: white;
          margin: 1rem 0;
        }
        .markdown-content h1 { font-size: 2.25rem; }
        .markdown-content h2 { font-size: 1.875rem; }
        .markdown-content h3 { font-size: 1.5rem; }
        .markdown-content p {
          margin: 0.5rem 0;
          color: rgba(255, 255, 255, 0.85);
        }
        .markdown-content ul,
        .markdown-content ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
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

export default WriteBlog;
