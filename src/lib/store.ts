import { create } from "zustand";

export type AppView = "landing" | "dashboard" | "tournament" | "league" | "admin" | "matchday" | "register" | "mytournament";
export type Division = "male" | "female";
export type NotifType = "donation" | "match" | "mvp" | "streak" | "victory";

interface Notification {
  id: string;
  type: NotifType;
  message: string;
}

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  admin: AdminUser | null;
}

interface AppState {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  division: Division;
  setDivision: (d: Division) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  donationPopup: { show: boolean; message: string };
  showDonationPopup: (msg: string) => void;
  hideDonationPopup: () => void;
  notifications: Notification[];
  addNotification: (type: NotifType, message: string) => void;
  removeNotification: (id: string) => void;
  adminAuth: AdminAuthState;
  setAdminAuth: (auth: AdminAuthState) => void;
  clearAdminAuth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "landing",
  setCurrentView: (view) => set({ currentView: view }),
  division: "male",
  setDivision: (d) => set({ division: d }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  loading: false,
  setLoading: (l) => set({ loading: l }),
  donationPopup: { show: false, message: "" },
  showDonationPopup: (msg) => set({ donationPopup: { show: true, message: msg } }),
  hideDonationPopup: () => set({ donationPopup: { show: false, message: "" } }),
  notifications: [],
  addNotification: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ notifications: [...s.notifications, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    }, 5000);
  },
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  adminAuth: { isAuthenticated: false, admin: null },
  setAdminAuth: (auth) => set({ adminAuth: auth }),
  clearAdminAuth: () => set({ adminAuth: { isAuthenticated: false, admin: null } }),
}));
