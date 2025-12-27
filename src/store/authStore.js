import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,

  login: async (username, password) => {
    try {
      const user = await window.api.login(username, password);
      if (user) {
        set({ currentUser: user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: '用户名或密码错误' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },
  
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.currentUser?.role === 'admin';
  },
}));
