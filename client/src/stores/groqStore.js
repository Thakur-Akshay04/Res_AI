import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let _dailyResetTimerId = null;

const useGroqStore = create(
  persist(
    (set, get) => ({
      groqStatus: null,
      isLoading: false,
      lastFetched: null,

      fetchGroqStatus: async (token, force = false) => {
        if (!token) return;

        const now = Date.now();
        const { lastFetched, isLoading } = get();

        if (isLoading) return;
        if (!force && lastFetched && (now - lastFetched) < 5000) return;

        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/user/groq-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success && json.data) {
            set({
              groqStatus: json.data,
              lastFetched: now,
              isLoading: false,
            });

            if (json.data.dailyResetAt) {
              get().scheduleResetRefresh(token, json.data.dailyResetAt);
            }
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      scheduleResetRefresh: (token, dailyResetAtISO) => {
        if (_dailyResetTimerId) {
          clearTimeout(_dailyResetTimerId);
          _dailyResetTimerId = null;
        }

        const resetTime = new Date(dailyResetAtISO).getTime();
        const now = Date.now();
        const delayMs = resetTime - now;

        if (delayMs > 0 && delayMs < 86400000) {
          _dailyResetTimerId = setTimeout(async () => {
            _dailyResetTimerId = null;
            const currentToken = token || useGroqStore.getState()._cachedToken;
            if (currentToken) {
              await new Promise(r => setTimeout(r, 2000));
              await get().fetchGroqStatus(currentToken, true);
            }
          }, delayMs);
        }
      },

      refreshAfterAIAction: async (token) => {
        if (!token) return;
        await new Promise(r => setTimeout(r, 600));
        await get().fetchGroqStatus(token, true);
      },

      clearGroqStatus: () => {
        if (_dailyResetTimerId) {
          clearTimeout(_dailyResetTimerId);
          _dailyResetTimerId = null;
        }
        set({ groqStatus: null, lastFetched: null, isLoading: false });
      },
    }),
    {
      name: 'groq-status-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        groqStatus: state.groqStatus,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => (state) => {},
    }
  )
);

export default useGroqStore;
