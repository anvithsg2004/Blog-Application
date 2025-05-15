const API_BASE_URL = "http://localhost:8080";

// Function to get the Base64-encoded credentials from localStorage
const getAuthCredentials = () => {
    return localStorage.getItem("authCredentials");
};

// Generic fetch function with authentication
const apiFetch = async (url, options = {}) => {
    const authCredentials = getAuthCredentials();
    const headers = new Headers(options.headers || {});

    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (authCredentials) {
        headers.set("Authorization", `Basic ${authCredentials}`);
        console.log("Authorization header size:", `Basic ${authCredentials}`.length);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || response.statusText);
        }

        return response;
    } catch (error) {
        console.error(`API fetch error for ${url}:`, error);
        throw error;
    }
};

// Export API methods
export const registerUser = async (formData) => {
    const response = await apiFetch("/api/users", {
        method: "POST",
        body: formData,
    });
    return response.json();
};

export const verifyOTP = async (email, otp) => {
    const response = await apiFetch("/api/users/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
    });
    return response.json();
};

export const resendOTP = async (email) => {
    const response = await apiFetch("/api/users/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    return response.json();
};

export const loginUser = async (email, password) => {
    const credentials = btoa(`${email}:${password}`);
    const response = await apiFetch("/api/users/profile", {
        method: "GET",
        headers: {
            "Authorization": `Basic ${credentials}`,
        },
    });

    // If successful, store the credentials
    localStorage.setItem("authCredentials", credentials);
    return response.json();
};

// Export the fetch function for other components to use
export default apiFetch;
