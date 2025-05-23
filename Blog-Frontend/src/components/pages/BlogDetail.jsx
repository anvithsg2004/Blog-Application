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
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [question, setQuestion] = useState('');
    const [qaHistory, setQaHistory] = useState([]);
    const [isAnswering, setIsAnswering] = useState(false);

    useEffect(() => {
        const fetchBlogAndSubscription = async () => {
            try {
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
                console.log("Blog API Response:", data);
                setBlog({
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    codeSnippet: data.codeSnippet
                        ? { language: data.codeLanguage || "javascript", content: data.codeSnippet }
                        : null,
                    imageUrl: data.image ? `data:image/jpeg;base64,${data.image}` : null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }).toUpperCase() : "Unknown",
                });
                setAuthor({
                    email: data.authorEmail,
                    name: data.author.name,
                    photo: data.author.photo ? `data:image/jpeg;base64,${data.author.photo}` : null,
                    about: data.author.about,
                    linkedin: data.author.linkedin,
                    github: data.author.github,
                    twitter: data.author.twitter,
                });

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

    const handleSummarize = async () => {
        if (!blog?.content) {
            toast({
                title: "No Content",
                description: "There is no content to summarize.",
                variant: "destructive",
            });
            return;
        }

        setIsSummarizing(true);
        setSummary('');
        setQaHistory([]); // Clear QA history when a new summary is generated

        try {
            let fullContent = blog.content || '';
            if (blog.codeSnippet?.content) {
                const cleanedCode = blog.codeSnippet.content
                    .replace(/\s+/g, ' ')
                    .trim();
                fullContent += `\n\nCode Example (${blog.codeSnippet.language}):\n${cleanedCode}`;
            }

            fullContent = fullContent
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                .replace(/["'`]/g, '"');

            const inputWords = fullContent.split(' ');
            const estimatedTokens = inputWords.length * 1.3;
            const maxTokens = 800;
            const maxWords = Math.floor(maxTokens / 1.3);
            const truncatedContent = inputWords.length > maxWords ? inputWords.slice(0, maxWords).join(' ') : fullContent;

            let contentToSummarize = truncatedContent.trim();
            if (!contentToSummarize) {
                throw new Error('Content is empty after processing.');
            }

            console.log('Content to summarize:', contentToSummarize);
            console.log('Estimated tokens:', contentToSummarize.split(' ').length * 1.3);

            const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer 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`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: contentToSummarize,
                    parameters: {
                        min_length: 50,
                        max_length: 1000,
                        do_sample: false,
                    },
                }),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Invalid input for summarization. The content may be too long or contain unsupported characters.');
                } else if (response.status === 401) {
                    throw new Error('Authentication failed. Please check your API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit reached. Please try again later.');
                } else if (response.status === 503) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const retryResponse = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer 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`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            inputs: contentToSummarize,
                            parameters: {
                                min_length: 50,
                                max_length: 1000,
                                do_sample: false,
                            },
                        }),
                    });
                    if (!retryResponse.ok) {
                        throw new Error('Model loading failed after retry. Please try again later.');
                    }
                    const retryResult = await retryResponse.json();
                    const fullSummary = retryResult[0].summary_text;
                    if (!fullSummary) {
                        throw new Error('No summary returned from the API.');
                    }
                    const retrySummaryWords = fullSummary.split(' ');
                    let currentSummary = '';
                    let index = 0;

                    const streamSummary = () => {
                        if (index < retrySummaryWords.length) {
                            currentSummary += (index > 0 ? ' ' : '') + retrySummaryWords[index];
                            setSummary(currentSummary);
                            index++;
                            setTimeout(streamSummary, 50);
                        } else {
                            setIsSummarizing(false);
                        }
                    };
                    streamSummary();
                    return;
                } else {
                    throw new Error('Failed to summarize the blog post.');
                }
            }

            const result = await response.json();
            if (!result[0]?.summary_text) {
                throw new Error('No summary returned from the API.');
            }

            const fullSummary = result[0].summary_text;
            const summaryWords = fullSummary.split(' ');
            let currentSummary = '';
            let index = 0;

            const streamSummary = () => {
                if (index < summaryWords.length) {
                    currentSummary += (index > 0 ? ' ' : '') + summaryWords[index];
                    setSummary(currentSummary);
                    index++;
                    setTimeout(streamSummary, 50);
                } else {
                    setIsSummarizing(false);
                }
            };
            streamSummary();

        } catch (error) {
            console.error('Summarization error:', error);
            toast({
                title: "Summarization Failed",
                description: error.message || "Could not summarize the blog post.",
                variant: "destructive",
            });
            setIsSummarizing(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) {
            toast({
                title: "Invalid Input",
                description: "Please enter a question.",
                variant: "destructive",
            });
            return;
        }

        if (!blog?.content) {
            toast({
                title: "No Content",
                description: "There is no blog content to answer from.",
                variant: "destructive",
            });
            return;
        }

        setIsAnswering(true);

        try {
            // Clean the blog content
            let contentToAnswer = blog.content
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                .replace(/["'`]/g, '"')
                .trim();

            if (!contentToAnswer) {
                throw new Error('Blog content is empty after processing.');
            }

            const response = await fetch('https://api-inference.huggingface.co/models/deepset/roberta-base-squad2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer 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`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: {
                        question: question.trim(),
                        context: contentToAnswer,
                    },
                }),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Invalid input for question answering.');
                } else if (response.status === 401) {
                    throw new Error('Authentication failed. Please check your API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit reached. Please try again later.');
                } else if (response.status === 503) {
                    throw new Error('Model is loading. Please try again later.');
                } else {
                    throw new Error('Failed to process the question.');
                }
            }

            const result = await response.json();
            if (!result.answer) {
                throw new Error('No answer returned from the API.');
            }

            setQaHistory([...qaHistory, { question: question.trim(), answer: result.answer }]);
            setQuestion('');
        } catch (error) {
            console.error('Question answering error:', error);
            toast({
                title: "Question Answering Failed",
                description: error.message || "Could not process your question.",
                variant: "destructive",
            });
        } finally {
            setIsAnswering(false);
        }
    };

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
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-transparent border border-[rgba(229,228,226,0.5)] text-white hover:bg-[rgba(229,228,226,0.1)] transition-brutal flex items-center justify-center"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        onClick={handleSummarize}
                        className={`px-4 py-2 text-sm font-medium font-['Space_Grotesk'] text-black bg-white hover:bg-[#E5E4E2] transition-brutal ${isSummarizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSummarizing || !blog?.content}
                    >
                        {isSummarizing ? 'Summarizing with AI...' : 'Summarize with AI'}
                    </button>
                </div>

                <header className="mb-12">
                    <div className="uppercase text-xs leading-tight tracking-[1px] text-[rgba(229,228,226,0.6)] mb-4">
                        {author.name}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-8">
                        {blog.title}
                    </h1>
                    {blog.imageUrl && (
                        <>
                            <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="w-full aspect-[21/9] object-cover mb-12"
                            />
                            {summary && (
                                <div className="mb-12">
                                    <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white mb-4">
                                        Summary
                                    </h3>
                                    <div className="p-4 bg-[rgba(229,228,226,0.1)] border-2 border-[rgba(229,228,226,0.3)] rounded-lg">
                                        <p className="text-white mb-4">{summary}</p>
                                        <div className="mt-4">
                                            <h4 className="text-lg font-['Space_Grotesk'] font-bold text-white mb-2">
                                                Have a question about the blog?
                                            </h4>
                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="text"
                                                    value={question}
                                                    onChange={(e) => setQuestion(e.target.value)}
                                                    placeholder="Ask a question about the blog..."
                                                    className="flex-1 px-3 py-2 bg-[rgba(229,228,226,0.1)] border border-[rgba(229,228,226,0.3)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                                                />
                                                <button
                                                    onClick={handleAskQuestion}
                                                    className={`px-4 py-2 text-sm font-medium font-['Space_Grotesk'] text-black bg-white hover:bg-[#E5E4E2] transition-brutal ${isAnswering ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isAnswering}
                                                >
                                                    {isAnswering ? 'Answering...' : 'Ask'}
                                                </button>
                                            </div>
                                            {qaHistory.length > 0 && (
                                                <div className="mt-4">
                                                    {qaHistory.map((qa, index) => (
                                                        <div key={index} className="mb-4">
                                                            <p className="text-[rgba(229,228,226,0.8)]">
                                                                <span className="font-bold">Q:</span> {qa.question}
                                                            </p>
                                                            <p className="text-white">
                                                                <span className="font-bold">A:</span> {qa.answer}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {!blog.imageUrl && summary && (
                        <div className="mb-12">
                            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white mb-4">
                                Summary
                            </h3>
                            <div className="p-4 bg-[rgba(229,228,226,0.1)] border-2 border-[rgba(229,228,226,0.3)] rounded-lg">
                                <p className="text-white mb-4">{summary}</p>
                                <div className="mt-4">
                                    <h4 className="text-lg font-['Space_Grotesk'] font-bold text-white mb-2">
                                        Have a question about the blog?
                                    </h4>
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="Ask a question about the blog..."
                                            className="flex-1 px-3 py-2 bg-[rgba(229,228,226,0.1)] border border-[rgba(229,228,226,0.3)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                                        />
                                        <button
                                            onClick={handleAskQuestion}
                                            className={`px-4 py-2 text-sm font-medium font-['Space_Grotesk'] text-black bg-white hover:bg-[#E5E4E2] transition-brutal ${isAnswering ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={isAnswering}
                                        >
                                            {isAnswering ? 'Answering...' : 'Ask'}
                                        </button>
                                    </div>
                                    {qaHistory.length > 0 && (
                                        <div className="mt-4">
                                            {qaHistory.map((qa, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-[rgba(229,228,226,0.8)]">
                                                        <span className="font-bold">Q:</span> {qa.question}
                                                    </p>
                                                    <p className="text-white">
                                                        <span className="font-bold">A:</span> {qa.answer}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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

                <div className="mt-8 mb-12">
                    <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white mb-4">
                        Publication Dates
                    </h3>
                    <div className="text-[rgba(229,228,226,0.8)]">
                        <p>
                            <span className="font-bold">Published:</span>{' '}
                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }) : 'Unknown'}
                        </p>
                        {blog.updatedAt && blog.createdAt && new Date(blog.updatedAt).getTime() !== new Date(blog.createdAt).getTime() && (
                            <p>
                                <span className="font-bold">Updated:</span>{' '}
                                {new Date(blog.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>

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
                            {author.email && (
                                <button
                                    onClick={handleSubscribeToggle}
                                    className={`mb-4 px-4 py-2 text-sm font-medium text-black bg-white hover:bg-[#E5E4E2] transition-brutal ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isSubscribing}
                                >
                                    {isSubscribing
                                        ? 'Processing...'
                                        : isSubscribed
                                            ? `Unsubscribe from ${author.name}`
                                            : `Subscribe to ${author.name}`}
                                </button>
                            )}
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
                    lineHeight: 1.6;
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
