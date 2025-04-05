import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (userData) => {
                // Extract token from userData and store it separately
                const { token, ...userInfo } = userData

                set({
                    user: userInfo,
                    token: token,
                    isAuthenticated: true,
                })
            },

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),

            updateUser: (userData) =>
                set((state) => ({
                    user: { ...state.user, ...userData },
                })),

            getToken: () => {
                // Helper function to access token (useful for API requests)
                const state = useAuthStore.getState()
                return state.token
            }
        }),
        {
            name: "auth-storage",
        },
    ),
)

export default useAuthStore