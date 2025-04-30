import React from "react";

export const Button = ({ children, className, ...props }) => {
    return (
        <button
            className={`px-4 py-2 font-bold ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
