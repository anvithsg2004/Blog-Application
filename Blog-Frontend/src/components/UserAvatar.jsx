import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const UserAvatar = ({ userImage = null, size = "md", isLoggedIn = false }) => {
    const navigate = useNavigate();
    const dimensions = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    const iconSize = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const handleClick = () => {
        navigate(isLoggedIn ? "/profile" : "/login");
    };

    return (
        <button
            onClick={handleClick}
            className={`
        ${dimensions[size]} 
        flex items-center justify-center 
        border-2 border-[rgba(229,228,226,0.5)] 
        hover:border-white transition-brutal 
        overflow-hidden bg-[rgba(229,228,226,0.1)]
        cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-white
        transform hover:scale-105
      `}
            aria-label="User profile"
        >
            {userImage ? (
                <img
                    src={userImage}
                    alt="User"
                    className="w-full h-full object-cover"
                />
            ) : (
                <User
                    size={iconSize[size]}
                    className="text-[rgba(229,228,226,0.8)]"
                />
            )}
        </button>
    );
};

export default UserAvatar;