import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import apiFetch from "../utils/api";

const EditBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [blogContent, setBlogContent] = useState("");
    const [codeContent, setCodeContent] = useState("");
    const [codeLanguage, setCodeLanguage] = useState("");
    const [title, setTitle] = useState("");
    const [currentImage, setCurrentImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Fetch blog data
    useEffect(() => {
        const fetchBlog = async () => {
            setIsLoading(true);
            try {
                const response = await apiFetch(`/api/blogs/${id}`);
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.setItem("redirectAfterLogin", `/blogs/edit/${id}`);
                        navigate("/login");
                        return;
                    }
                    throw new Error("Failed to fetch blog");
                }
                const data = await response.json();
                setTitle(data.title);
                setBlogContent(data.content);
                setCodeContent(data.codeSnippet || "");
                setCodeLanguage(data.codeLanguage || "");
                setCurrentImage(data.image ? `data:image/jpeg;base64,${data.image}` : null);
                setPreviewUrl(data.image ? `data:image/jpeg;base64,${data.image}` : null);
            } catch (error) {
                console.error("Failed to fetch blog:", error);
                toast({
                    title: "Error fetching blog",
                    description: "Could not load the blog post. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlog();
    }, [id, navigate, toast]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create a preview URL
            const fileReader = new FileReader();
            fileReader.onload = () => {
                if (fileReader.result) {
                    setPreviewUrl(fileReader.result);
                }
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
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

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("title", title);
            formData.append("content", blogContent);
            if (codeContent) {
                formData.append("code", codeContent);
                formData.append("language", codeLanguage || "javascript");
            }
            if (selectedFile) {
                formData.append("image", selectedFile);
            }

            const response = await apiFetch("/api/blogs", {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.setItem("redirectAfterLogin", `/blogs/edit/${id}`);
                    navigate("/login");
                    return;
                }
                throw new Error("Failed to update blog");
            }

            toast({
                title: "Blog updated successfully!",
                description: "Your changes have been saved.",
            });

            navigate("/profile");
        } catch (error) {
            console.error("Error updating blog:", error);
            toast({
                title: "Error updating blog",
                description: "Could not save your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/60 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-black">
            <div className="max-w-7xl mx-auto py-16 px-6">
                <div className="mb-12 flex items-center">
                    <button
                        onClick={handleCancel}
                        className="mr-4 p-2 bg-transparent border border-[rgba(229,228,226,0.5)] text-white hover:bg-[rgba(229,228,226,0.1)] transition-brutal flex items-center justify-center"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white">
                        EDIT BLOG
                    </h1>
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
                        />
                    </div>

                    {/* Blog Content */}
                    <div className="grid gap-2">
                        <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">Blog Content</label>
                        <textarea
                            id="blogContent"
                            value={blogContent}
                            onChange={(e) => setBlogContent(e.target.value)}
                            className="min-h-[300px] p-6 bg-black border border-[rgba(229,228,226,0.5)] font-['Inter'] text-lg leading-relaxed outline-none inset-shadow transition-brutal"
                            placeholder="Start writing your blog post here..."
                        />
                    </div>

                    {/* Code Language */}
                    <div className="grid gap-2">
                        <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">Code Language (Optional)</label>
                        <input
                            id="codeLanguage"
                            value={codeLanguage}
                            onChange={(e) => setCodeLanguage(e.target.value)}
                            className="p-4 border-4 border-white bg-black text-xl font-['Space_Grotesk'] focus:border-[#E5E4E2] outline-none transition-brutal"
                            placeholder="e.g., javascript, python"
                        />
                    </div>

                    {/* Code Content */}
                    <div className="grid gap-2">
                        <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">Code Snippet (Optional)</label>
                        <textarea
                            id="codeContent"
                            value={codeContent}
                            onChange={(e) => setCodeContent(e.target.value)}
                            className="min-h-[200px] p-6 bg-black border border-[rgba(229,228,226,0.5)] font-mono outline-none inset-shadow transition-brutal"
                            placeholder="// Add your code snippet here..."
                        />
                    </div>

                    {/* File Upload */}
                    <div className="grid gap-4">
                        <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">Featured Image</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                <div className="border-2 border-dashed border-[rgba(229,228,226,0.5)] p-6 text-center cursor-pointer hover:border-[#E5E4E2] transition-brutal">
                                    <input
                                        type="file"
                                        id="featured-image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
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
                                            {selectedFile ? selectedFile.name : "Upload a new image"}
                                        </span>
                                        <p className="text-[rgba(229,228,226,0.5)] text-sm mt-1">
                                            PNG, JPG or GIF up to 10MB
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {previewUrl && (
                                <div className="w-full md:w-1/3 border border-[rgba(229,228,226,0.3)]">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="p-2 text-center text-[rgba(229,228,226,0.5)] text-xs">
                                        {selectedFile ? "New image" : "Current image"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between items-center pt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-transparent border border-[rgba(229,228,226,0.5)] text-white py-3 px-6 cursor-pointer flex items-center transition-brutal hover:bg-[rgba(229,228,226,0.1)]"
                        >
                            CANCEL
                        </button>

                        <Button
                            type="submit"
                            className="py-6 px-8 font-['Space_Grotesk'] font-bold flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                    UPDATING...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    SAVE CHANGES
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBlog;