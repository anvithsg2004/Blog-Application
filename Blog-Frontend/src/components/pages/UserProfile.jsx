import React, { useState, useEffect, useContext } from "react";
import { Camera, Edit, Check, X, ArrowRight, Trash, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import BlogCard from "../BlogCard";
import { Link, useNavigate } from "react-router-dom";
import apiFetch from "../utils/api";
import { AuthContext } from "../AuthContext";

const UserProfile = () => {
    const { user, isLoggedIn } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [activeTab, setActiveTab] = useState("info");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            console.log("UserProfile: isLoggedIn:", isLoggedIn, "user:", user);
            if (!isLoggedIn) {
                console.log("UserProfile: Not logged in, redirecting to /login");
                navigate("/login");
                return;
            }

            try {
                setLoading(true);
                const response = await apiFetch("/api/users/profile", {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.setItem("redirectAfterLogin", "/profile");
                        navigate("/login");
                        return;
                    }
                    throw new Error("Failed to fetch profile data");
                }

                const data = await response.json();
                console.log("UserProfile: Fetched user data:", data);
                const userInfo = data.user;
                const userBlogs = data.blogs || [];

                const joinedDate = new Date(userInfo.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                });

                const formattedUser = {
                    ...userInfo,
                    joinedDate,
                    location: userInfo.location || "Not specified",
                    photo: userInfo.photo || null,
                };

                setUserData(formattedUser);
                setEditedData(formattedUser);
                setPreviewUrl(userInfo.photo ? `data:image/jpeg;base64,${userInfo.photo}` : "");
                setBlogs(
                    userBlogs.map((blog) => ({
                        id: blog.id,
                        title: blog.title,
                        excerpt: blog.content.split("\n")[0].substring(0, 100) + "...",
                        imageUrl: blog.image
                            ? `data:image/jpeg;base64,${blog.image}`
                            : "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
                        authorName: userInfo.name,
                        date: new Date(blog.createdAt)
                            .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            .toUpperCase(),
                    }))
                );
            } catch (error) {
                console.error("UserProfile: Failed to load profile data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load profile data.",
                    variant: "destructive",
                });
                if (!isLoggedIn) {
                    console.log("UserProfile: Not logged in after fetch failure, redirecting to /login");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isLoggedIn, navigate, toast, user]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedData(userData);
            setPreviewUrl(userData.photo ? `data:image/jpeg;base64,${userData.photo}` : "");
            setSelectedFile(null);
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData({
            ...editedData,
            [name]: value,
        });
    };

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

    const handleRemovePhoto = () => {
        setEditedData({
            ...editedData,
            photo: null,
        });
        setPreviewUrl("");
        setSelectedFile(null);

        toast({
            title: "Photo removed",
            description: "Your profile photo has been removed.",
            variant: "success",
        });
    };

    const handleSaveChanges = async () => {
        try {
            const updatedUser = {
                name: editedData.name,
                phone: editedData.phone,
                linkedin: editedData.linkedin,
                github: editedData.github,
                twitter: editedData.twitter,
                about: editedData.about,
                location: editedData.location,
            };

            await apiFetch("/api/users/profile", {
                method: "PUT",
                headers: {
                    Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            });

            if (selectedFile) {
                const formData = new FormData();
                formData.append("photo", selectedFile);
                await apiFetch("/api/users/profile/photo", {
                    method: "PATCH",
                    headers: {
                        Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
                    },
                    body: formData,
                });
                toast({
                    title: "Photo uploaded",
                    description: "Your new profile photo has been uploaded.",
                    variant: "success",
                });
            }

            const response = await apiFetch("/api/users/profile", {
                method: "GET",
                headers: {
                    Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
                },
            });
            const data = await response.json();
            const userInfo = data.user;

            const joinedDate = new Date(userInfo.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });

            const updatedData = {
                ...userInfo,
                joinedDate,
                location: userInfo.location || "Not specified",
                photo: userInfo.photo || null,
            };

            setUserData(updatedData);
            setEditedData(updatedData);
            setPreviewUrl(userInfo.photo ? `data:image/jpeg;base64,${userInfo.photo}` : "");
            setIsEditing(false);
            setSelectedFile(null);

            toast({
                title: "Profile updated",
                description: "Your profile information has been saved.",
                variant: "success",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
            try {
                const response = await apiFetch(`/api/blogs/${blogId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Basic ${localStorage.getItem("authCredentials")}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.setItem("redirectAfterLogin", "/profile");
                        navigate("/login");
                        return;
                    }
                    throw new Error("Failed to delete blog");
                }

                setBlogs(blogs.filter((blog) => blog.id !== blogId));
                toast({
                    title: "Blog deleted",
                    description: "Your blog post has been permanently deleted.",
                    variant: "success",
                });
            } catch (error) {
                console.error("Error deleting blog:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete blog. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleEditBlog = (blogId) => {
        navigate(`/edit-blog/${blogId}`);
    };

    if (loading) {
        return <div className="pt-20 min-h-screen bg-black text-white text-center">Loading...</div>;
    }

    if (!userData && !isLoggedIn) {
        return null;
    }

    return (
        <div className="pt-20 min-h-screen bg-black">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[-1px] text-white mb-4">
                        MY PROFILE
                    </h1>
                    <p className="text-[rgba(229,228,226,0.8)] max-w-3xl">
                        Manage your personal information and view your published content
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="border-4 border-white p-6 brutal-shadow">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6 group">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt={editedData.name || "Profile"}
                                            className="w-48 h-48 object-cover border-2 border-white"
                                            onError={(e) => {
                                                e.target.src = "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg";
                                                console.error("Failed to load profile image");
                                            }}
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-[rgba(229,228,226,0.1)] border-2 border-white flex items-center justify-center">
                                            <Camera size={48} className="text-[rgba(229,228,226,0.5)]" />
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-brutal">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleRemovePhoto}
                                                    className="p-2 bg-red-600 text-white"
                                                    title="Remove photo"
                                                >
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px] mb-1">
                                    {editedData.name || "User"}
                                </h2>
                                <p className="text-[rgba(229,228,226,0.8)] mb-6">{editedData.email || "No email"}</p>

                                {isEditing && (
                                    <div className="w-full grid gap-4 mt-4">
                                        <div className="relative border border-[rgba(229,228,226,0.5)] p-3 bg-black hover:border-white transition-brutal">
                                            <input
                                                type="file"
                                                id="photo-upload"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex items-center justify-center gap-2">
                                                <Camera size={18} className="text-[rgba(229,228,226,0.8)]" />
                                                <span className="text-[rgba(229,228,226,0.8)]">
                                                    {selectedFile ? selectedFile.name : "Upload New Photo"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col border-4 border-white brutal-shadow">
                            <button
                                className={`p-4 text-left font-['Space_Grotesk'] font-bold text-lg transition-brutal ${activeTab === "info" ? "bg-white text-black" : "bg-black text-white hover:bg-[rgba(229,228,226,0.1)]"
                                    }`}
                                onClick={() => setActiveTab("info")}
                            >
                                PROFILE INFORMATION
                            </button>
                            <button
                                className={`p-4 text-left font-['Space_Grotesk'] font-bold text-lg transition-brutal ${activeTab === "blogs" ? "bg-white text-black" : "bg-black text-white hover:bg-[rgba(229,228,226,0.1)]"
                                    }`}
                                onClick={() => setActiveTab("blogs")}
                            >
                                MY BLOGS
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        {activeTab === "info" ? (
                            <div className="border-4 border-white p-6 md:p-8 brutal-shadow">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px]">
                                        PROFILE INFORMATION
                                    </h3>
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex items-center gap-2 bg-transparent text-white border border-[rgba(229,228,226,0.5)] py-2 px-4 transition-brutal hover:bg-[rgba(229,228,226,0.1)]"
                                    >
                                        {isEditing ? (
                                            <>
                                                <X size={16} /> CANCEL
                                            </>
                                        ) : (
                                            <>
                                                <Edit size={16} /> EDIT
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid gap-8">
                                    <ProfileField
                                        label="Full Name"
                                        value={editedData.name || ""}
                                        name="name"
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />

                                    <ProfileField
                                        label="Email"
                                        value={editedData.email || ""}
                                        isEditing={false}
                                        disabled={true}
                                    />

                                    <ProfileField
                                        label="Phone Number"
                                        value={editedData.phone || ""}
                                        name="phone"
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />

                                    <ProfileField
                                        label="LinkedIn Profile"
                                        value={editedData.linkedin || ""}
                                        name="linkedin"
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />

                                    <ProfileField
                                        label="GitHub Profile"
                                        value={editedData.github || ""}
                                        name="github"
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />

                                    <ProfileField
                                        label="X (Twitter) Profile"
                                        value={editedData.twitter || ""}
                                        name="twitter"
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />

                                    <div className="grid gap-2">
                                        <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">
                                            About Me
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                name="about"
                                                value={editedData.about || ""}
                                                onChange={handleInputChange}
                                                className="w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none transition-brutal focus:border-white min-h-[120px]"
                                            />
                                        ) : (
                                            <p className="text-white/85 border border-transparent p-4">
                                                {editedData.about || "No about information provided"}
                                            </p>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <Button
                                            onClick={handleSaveChanges}
                                            className="w-full md:w-auto md:ml-auto mt-4 py-6 flex items-center justify-center font-['Space_Grotesk'] font-bold group"
                                        >
                                            SAVE CHANGES
                                            <Check className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="border-4 border-white p-6 md:p-8 brutal-shadow">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-['Space_Grotesk'] font-bold tracking-[-1px]">
                                        MY BLOGS
                                    </h3>
                                    <Button
                                        className="py-4 flex items-center font-['Space_Grotesk'] font-bold group"
                                        onClick={() => navigate("/write-blog")}
                                    >
                                        WRITE NEW BLOG
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Button>
                                </div>

                                {blogs.length > 0 ? (
                                    <div className="grid gap-8">
                                        {blogs.map((blog) => (
                                            <div key={blog.id} className="relative">
                                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                                    <button
                                                        onClick={() => handleEditBlog(blog.id)}
                                                        className="p-2 bg-black border border-white text-white hover:bg-white hover:text-black transition-brutal"
                                                        title="Edit blog"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBlog(blog.id)}
                                                        className="p-2 bg-black border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-brutal"
                                                        title="Delete blog"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                                <BlogCard {...blog} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 border border-[rgba(229,228,226,0.2)]">
                                        <p className="text-[rgba(229,228,226,0.8)] mb-6">
                                            You haven't published any blogs yet
                                        </p>
                                        <Button
                                            className="py-4 flex items-center font-['Space_Grotesk'] font-bold group"
                                            onClick={() => navigate("/write-blog")}
                                        >
                                            WRITE YOUR FIRST BLOG
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileField = ({ label, value, name, isEditing, onChange, disabled = false }) => (
    <div className="grid gap-2">
        <label className="uppercase text-xs tracking-[1px] text-[#E5E4E2]">{label}</label>
        {isEditing && !disabled ? (
            <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className={`w-full p-4 bg-black border border-[rgba(229,228,226,0.5)] text-white outline-none transition-brutal ${disabled ? "opacity-60 cursor-not-allowed" : "focus:border-white"
                    }`}
            />
        ) : (
            <p className={`text-white/85 border border-transparent p-4 ${disabled ? "opacity-60" : ""}`}>
                {value || "Not specified"}
            </p>
        )}
        {name === "email" && isEditing && (
            <p className="text-xs text-[rgba(229,228,226,0.6)] mt-1">
                Email cannot be changed
            </p>
        )}
    </div>
);

export default UserProfile;
