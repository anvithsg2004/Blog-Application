import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Linkedin, Twitter, Github, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommentSection from '../CommentSection';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import apiFetch from "../utils/api";
import { marked } from "marked";
import DOMPurify from "dompurify";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState(null);
    const [author, setAuthor] = useState(null);
    const [linkError, setLinkError] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    // Fetch blog data and subscription status
    useEffect(() => {
        const fetchBlogAndSubscription = async () => {
            try {
                // Fetch blog
                const blogResponse = await apiFetch(`/api/blogs/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${localStorage.getItem("authCredentials")}`,
                    },
                });
                if (!blogResponse.ok) {
                    if (blogResponse.status === 401) {
                        localStorage.setItem("redirectAfterLogin", `/blog/${id}`);
                        navigate("/login");
                        return;
                    }
                    throw new Error("Failed to fetch blog");
                }
                const data = await blogResponse.json();
                console.log("Blog API Response:", data); // Debug log
                setBlog({
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    codeSnippet: data.codeSnippet
                        ? { language: data.codeLanguage || "javascript", content: data.codeSnippet }
                        : null,
                    imageUrl: data.image ? `data:image/jpeg;base64,${data.image}` : null,
                    date: new Date(data.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }).toUpperCase(),
                });
                setAuthor({
                    email: data.authorEmail, // Use authorEmail instead of author.id
                    name: data.author.name,
                    photo: data.author.photo ? `data:image/jpeg;base64,${data.author.photo}` : null,
                    about: data.author.about,
                    linkedin: data.author.linkedin,
                    github: data.author.github,
                    twitter: data.author.twitter,
                });

                // Fetch subscription status only if authorEmail exists
                if (!data.authorEmail) {
                    console.warn("Author email is missing, skipping subscription status fetch");
                    setLoading(false);
                    return;
                }

                console.log("Fetching subscription status for author email:", data.authorEmail);
                const subscriptionResponse = await apiFetch(`/api/subscribers/author/email/${encodeURIComponent(data.authorEmail)}/status`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${localStorage.getItem("authCredentials")}`,
                    },
                });
                if (subscriptionResponse.ok) {
                    const subscriptionData = await subscriptionResponse.json();
                    setIsSubscribed(subscriptionData.isSubscribed);
                } else {
                    console.warn("Failed to fetch subscription status, proceeding without it");
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching blog or subscription status:", error);
                setLinkError(true);
                setLoading(false);
            }
        };

        fetchBlogAndSubscription();
    }, [id, navigate]);

    const handleSubscribeToggle = async () => {
        if (!author.email) {
            toast({
                title: "Subscription Unavailable",
                description: "Cannot subscribe due to missing author information.",
                variant: "destructive",
            });
            return;
        }

        setIsSubscribing(true);
        try {
            const endpoint = isSubscribed
                ? `/api/subscribers/author/email/${encodeURIComponent(author.email)}/unsubscribe`
                : `/api/subscribers/author/email/${encodeURIComponent(author.email)}`;
            const method = isSubscribed ? "DELETE" : "POST";

            const response = await apiFetch(endpoint, {
                method,
                headers: {
                    "Authorization": `Basic ${localStorage.getItem("authCredentials")}`,
                    "Content-Type": method === "POST" ? "application/json" : undefined,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update subscription");
            }

            setIsSubscribed(!isSubscribed);
            toast({
                title: isSubscribed ? "Unsubscribed" : "Subscribed!",
                description: isSubscribed
                    ? `You have unsubscribed from ${author.name}'s updates.`
                    : `You will receive updates from ${author.name}.`,
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Subscription Failed",
                description: error.message || "Something went wrong. Try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            toast({
                title: "Code Copied",
                description: "The code snippet has been copied to your clipboard.",
                variant: "success",
            });
        }).catch((err) => {
            console.error('Failed to copy code:', err);
            toast({
                title: "Copy Failed",
                description: "Failed to copy the code snippet.",
                variant: "destructive",
            });
        });
    };

    // Parse Markdown with error handling
    let renderedContent;
    try {
        const markdownContent = marked(blog?.content || "No content available");
        renderedContent = DOMPurify.sanitize(markdownContent);
    } catch (err) {
        console.error("Error parsing Markdown:", err);
        renderedContent = blog?.content || "No content available";
    }

    if (loading) {
        return (
            <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/60 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (linkError) {
        return (
            <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Blog not found or you are not authorized to view it.</p>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-black">
            <article className="max-w-4xl mx-auto px-4 py-16">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 p-2 bg-transparent border border-[rgba(229,228,226,0.5)] text-white hover:bg-[rgba(229,228,226,0.1)] transition-brutal flex items-center justify-center"
                >
                    <ArrowLeft size={20} />
                </button>

                <header className="mb-12">
                    <div className="uppercase text-xs leading-tight tracking-[1px] text-[rgba(229,228,226,0.6)] mb-4">
                        {blog.date} • {author.name}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
                        {blog.title}
                    </h1>
                    {blog.imageUrl && (
                        <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-full aspect-[21/9] object-cover mb-12"
                        />
                    )}
                </header>

                <div className="prose prose-invert max-w-none markdown-content">
                    {renderedContent.includes('<') ? (
                        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                            {renderedContent}
                        </div>
                    )}
                </div>

                {/* Code Snippet Section */}
                {blog.codeSnippet && (
                    <div className="mt-8 mb-12">
                        <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white mb-4">
                            Code Example
                        </h3>
                        <div className="relative rounded-lg bg-[#1E1E1E] p-4 border-2 border-gradient-to-r from-[#4B6CB7] to-[#182848] shadow-lg">
                            <div className="absolute top-3 left-4 text-xs text-gray-300 uppercase bg-[#2D2D2D] px-2 py-1 rounded-sm shadow-sm">
                                {blog.codeSnippet.language}
                            </div>
                            <div className="absolute top-3 right-4">
                                <button
                                    onClick={() => handleCopyCode(blog.codeSnippet.content.trim())}
                                    className="text-gray-300 hover:text-white transition-colors bg-[#2D2D2D] p-1 rounded-sm hover:bg-[#3D3D3D] shadow-sm"
                                    title="Copy code"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <SyntaxHighlighter
                                language={blog.codeSnippet.language}
                                style={vscDarkPlus}
                                customStyle={{
                                    background: 'transparent',
                                    padding: '1rem 0 0 0',
                                    margin: '0',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    borderRadius: '0.5rem',
                                }}
                                codeTagProps={{
                                    style: {
                                        fontFamily: "'Fira Code', 'Consolas', monospace",
                                        lineHeight: '1.6',
                                    },
                                }}
                            >
                                {blog.codeSnippet.content.trim()}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                )}

                {/* Author information */}
                <div className="mt-16 pt-8 border-t border-[rgba(229,228,226,0.3)]">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {author.photo && (
                            <img
                                src={author.photo}
                                alt={author.name}
                                className="w-24 h-24 object-cover border-2 border-white"
                            />
                        )}
                        <div>
                            <h3 className="text-xl font-['Space_Grotesk'] font-bold mb-2 text-center md:text-left">
                                {author.name}
                            </h3>
                            <p className="text-[rgba(229,228,226,0.8)] mb-4 text-center md:text-left">
                                {author.about}
                            </p>

                            {/* Subscribe Button (only if author.email exists) */}
                            {author.email && (
                                <button
                                    onClick={handleSubscribeToggle}
                                    className={`mb-4 px-4 py-2 text-sm font-medium text-black bg-white hover:bg-[#E5E4E2] transition-brutal ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    disabled={isSubscribing}
                                >
                                    {isSubscribing
                                        ? 'Processing...'
                                        : isSubscribed
                                            ? `Unsubscribe from ${author.name}`
                                            : `Subscribe to ${author.name}`}
                                </button>
                            )}

                            {/* Social Links */}
                            <div className="flex gap-4 justify-center md:justify-start">
                                {author.linkedin && (
                                    <a
                                        href={author.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 border border-[rgba(229,228,226,0.5)] text-[rgba(229,228,226,0.8)] hover:text-white hover:border-white transition-brutal"
                                        title="LinkedIn Profile"
                                    >
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                {author.twitter && (
                                    <a
                                        href={author.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 border border-[rgba(229,228,226,0.5)] text-[rgba(229,228,226,0.8)] hover:text-white hover:border-white transition-brutal"
                                        title="X (Twitter) Profile"
                                    >
                                        <Twitter size={18} />
                                    </a>
                                )}
                                {author.github && (
                                    <a
                                        href={author.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 border border-[rgba(229,228,226,0.5)] text-[rgba(229,228,226,0.8)] hover:text-white hover:border-white transition-brutal"
                                        title="GitHub Profile"
                                    >
                                        <Github size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <CommentSection blogId={blog.id} />
            </article>

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
                    color: rgba(229, 228, 226, 0.8);
                    line-height: 1.6;
                }
                .markdown-content ul,
                .markdown-content ol {
                    margin: 0.5rem 0;
                    padding-left: 2rem;
                    color: rgba(229, 228, 226, 0.8);
                }
                .markdown-content li {
                    margin: 0.25rem 0;
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
                    font-family: 'Fira Code', 'Consolas', monospace;
                }
                .markdown-content pre {
                    background: #1e1e1e;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                }
            `}</style>
        </div>
    );
};

export default BlogDetail;
