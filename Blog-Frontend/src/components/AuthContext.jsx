import React, { createContext, useState, useEffect } from "react";
import apiFetch from "../components/utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        const credentials = localStorage.getItem("authCredentials");
        console.log("Checking auth status with credentials:", credentials);
        if (credentials) {
            try {
                const response = await apiFetch("/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": `Basic ${credentials}`,
                    },
                });
                const data = await response.json();
                console.log("Auth status response:", data);
                if (!data.user.isVerified) {
                    throw new Error("User account is not verified");
                }
                setUser(data.user);
                setIsLoggedIn(true);
                localStorage.setItem("isLoggedIn", "true");
                console.log("Auth status verified, user:", data.user);
            } catch (error) {
                console.error("Failed to verify auth status:", error);
                localStorage.removeItem("authCredentials");
                localStorage.removeItem("isLoggedIn");
                setIsLoggedIn(false);
                setUser(null);
            }
        } else {
            localStorage.removeItem("isLoggedIn");
            setIsLoggedIn(false);
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (email, password, onSuccess) => {
        try {
            setLoading(true);
            const credentials = btoa(`${email}:${password}`);
            const response = await apiFetch("/api/users/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                },
            });
            const data = await response.json();
            console.log("Login response:", data);
            if (!data.user?.isVerified) {
                throw new Error(`User account is not verified. isVerified: ${data.user?.isVerified}`);
            }
            localStorage.setItem("authCredentials", credentials);
            localStorage.setItem("isLoggedIn", "true");
            setUser(data.user);
            setIsLoggedIn(true);
            setLoading(false);
            console.log("Logged in, user:", data.user);
            if (onSuccess) onSuccess();
            return data;
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("authCredentials");
        localStorage.removeItem("isLoggedIn");
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
        console.log("Logged out");
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
