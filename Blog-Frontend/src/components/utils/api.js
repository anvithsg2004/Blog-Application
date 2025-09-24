import authService from '../../services/authService';

const API_BASE_URL = "http://localhost:8080";

// const API_BASE_URL = "https://blogs-backend-w9x0.onrender.com";

/**
 * Enhanced API fetch function that works with both OAuth and Basic Auth
 */
const apiFetch = async (url, options = {}) => {
    try {
        // Use the auth service for authenticated requests
        return await authService.authenticatedFetch(url, options);
    } catch (error) {
        console.error(`API fetch error for ${url}:`, error);
        throw error;
    }
};

/**
 * Legacy functions for backward compatibility
 * These now use the unified auth service
 */
export const registerUser = async (formData) => {
    return await authService.registerUser(formData);
};

export const verifyOTP = async (email, otp) => {
    return await authService.verifyOTP(email, otp);
};

export const resendOTP = async (email) => {
    return await authService.resendOTP(email);
};

export const loginUser = async (email, password) => {
    const result = await authService.loginWithCredentials(email, password);
    return result.user;
};

// Export the enhanced fetch function as default
export default apiFetch;