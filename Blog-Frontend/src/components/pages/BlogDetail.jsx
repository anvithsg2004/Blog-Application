import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Linkedin, Twitter, Github, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommentSection from '../CommentSection';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState(null);
    const [author, setAuthor] = useState(null);
    const [linkError, setLinkError] = useState(false);

    // Fetch blog and author data
    useEffect(() => {
        setTimeout(() => {
            // Mock blog data with separate code snippet
            const blogData = {
                id,
                title: "The Future of Brutalist Design in Digital Spaces",
                content: `
                Brutalist design, with its raw and uncompromising aesthetic, has found new life in the digital realm. 
                This renaissance challenges conventional web design paradigms, offering a bold alternative to the 
                homogenized interfaces we've grown accustomed to.

                The principles of brutalism - honesty in materials, exposed structure, and functional design - translate 
                surprisingly well to digital interfaces. In web design, this manifests as exposed HTML elements, 
                system fonts, and a departure from skeuomorphic design patterns.

                This approach isn't merely aesthetic rebellion; it's a response to users' growing sophistication and 
                desire for authentic digital experiences. By stripping away unnecessary ornamentation, brutalist 
                design focuses attention on content and functionality.
                `,
                codeSnippet: {
                    language: "javascript",
                    content: `
function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}
                    `
                },
                imageUrl: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
                authorId: "user-1",
                authorName: "Alex Mitchell",
                date: "APR 25, 2025"
            };

            setBlog(blogData);

            // Mock author data
            const authorData = {
                id: "user-1",
                name: "Alex Mitchell",
                photo: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
                linkedin: "https://linkedin.com/in/alexmitchell",
                github: "https://github.com/alexmitchell",
                twitter: "https://twitter.com/alexmitchell",
                about: "Senior UI/UX designer specializing in brutalist and minimalist interfaces."
            };

            setAuthor(authorData);

            setLoading(false);
        }, 800);
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/60 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (linkError) {
        return null;
    }

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
                        {blog.date} • {blog.authorName}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
                        {blog.title}
                    </h1>
                    <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full aspect-[21/9] object-cover mb-12"
                    />
                </header>

                <div className="prose prose-invert max-w-none">
                    {blog.content.split('\n\n').map((paragraph, index) => (
                        <p
                            key={`para-${index}`}
                            className="text-lg leading-relaxed text-[rgba(229,228,226,0.8)] mb-6"
                        >
                            {paragraph}
                        </p>
                    ))}
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
        </div>
    );
};

export default BlogDetail;