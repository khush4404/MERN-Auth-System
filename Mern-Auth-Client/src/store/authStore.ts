import { create } from 'zustand';

type User = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    location?: string;
    phoneNo?: string;
    role?: string;
    status?: string;
    imgUrl?: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setAuth: (auth: boolean) => void;
    setAuthUser: (user: User) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) => set({ user }),
    setAuth: (auth) => set({ isAuthenticated: auth }),
    setAuthUser: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));
