import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      rateLimited: false,

      login: (user, token) => {
        set({ user, token, rateLimited: false });
        try {
          import('./groqStore').then(({ default: useGroqStore }) => {
            useGroqStore.getState().fetchGroqStatus(token, true);
          });
        } catch (err) {
          console.error('Error fetching Groq status on login:', err);
        }
      },

      logout: async () => {
        try {
          const { default: useGroqStore } = await import('./groqStore');
          useGroqStore.getState().clearGroqStatus();
          sessionStorage.removeItem('groq-status-storage');
        } catch {}
        set({ user: null, token: null, rateLimited: false });
      },

      setUser: (user) => set({ user }),

      setRateLimited: (val) => set({ rateLimited: val }),

      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rateLimited: state.rateLimited,
      }),
    }
  )
);

export default useAuthStore;
