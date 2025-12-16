// Simple auth utility for client-side authentication

export interface User {
    id: number;
    email: string;
    name: string | null;
}

export interface AuthToken {
    userId: number;
    email: string;
    name: string | null;
    exp: number;
}

const AUTH_TOKEN_KEY = "auth_token";
const USER_KEY = "user";

// Save auth data to localStorage
export function saveAuth(token: string, user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Get token from localStorage
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Get user from localStorage
export function getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

// Check if user is logged in (token exists and not expired)
export function isLoggedIn(): boolean {
    const token = getToken();
    if (!token) return false;

    try {
        const decoded: AuthToken = JSON.parse(
            Buffer.from(token, "base64").toString("utf-8")
        );
        return decoded.exp > Date.now();
    } catch {
        return false;
    }
}

// Clear auth data (logout)
export function logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
