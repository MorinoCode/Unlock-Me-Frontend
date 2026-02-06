import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";
import { AuthContext } from "./AuthContextInstance";
import { useExploreStore } from "../store/exploreStore";
import { useSwipeStore } from "../store/swipeStore";
import { useBlindDateStore } from "../store/blindDateStore";
import { useExploreViewAllStore } from "../store/exploreViewAllStore";
import { useGoDateStore } from "../store/goDateStore";
import { useFeedStore } from "../store/feedStore";
import { useMatchesStore } from "../store/matchesStore";
import { useInboxStore } from "../store/inboxStore";
import { useProfileStore } from "../store/profileStore";
import { useUserDetailsStore } from "../store/userDetailsStore";
import { useNotificationsStore } from "../store/notificationsStore";
import { useUnreadCountStore } from "../store/unreadCountStore";
import { useLocationsStore } from "../store/locationsStore";
import { usePlansStore } from "../store/plansStore";
import { useChatMessagesStore } from "../store/chatMessagesStore";
import { useInterestsOptionsStore } from "../store/interestsOptionsStore";
import { useQuestionsStore } from "../store/questionsStore";
import { useCommentsStore } from "../store/commentsStore";
import { useBlindDateSessionStore } from "../store/blindDateSessionStore";
import { useGoDateDetailsStore } from "../store/goDateDetailsStore";
import { useUserInterestsStore } from "../store/userInterestsStore";
import { useInsightsStore } from "../store/insightsStore";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/getUserInformation`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        const userId = data?._id || data?.userId;
        if (userId) useProfileStore.getState().fetchProfile(API_URL, userId, true).catch(() => {});
        return true;
      }

      // 401 Unauthorized = کاربر لاگین نیست - این یک حالت عادی است و نباید خطا باشد
      if (res.status === 401) {
        setCurrentUser(null);
        return false;
      }

      // برای سایر خطاها فقط در development لاگ کن
      if (import.meta.env.DEV && res.status !== 401) {
        console.warn(`Auth check failed with status: ${res.status}`);
      }

      setCurrentUser(null);
      return false;
    } catch (err) {
      // فقط خطاهای network را لاگ کن، نه 401
      // 401 یک حالت عادی است وقتی کاربر لاگین نیست
      if (import.meta.env.DEV) {
        console.error('Auth check network error:', err);
      }
      setCurrentUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // 🔁 هر بار route عوض شد auth را sync کن
  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  // Clear caches when user logs out
  useEffect(() => {
    if (!currentUser) {
      useExploreStore.getState().reset();
      useSwipeStore.getState().reset();
      useBlindDateStore.getState().reset();
      useExploreViewAllStore.getState().reset();
      useGoDateStore.getState().reset();
      useFeedStore.getState().reset();
      useMatchesStore.getState().reset();
      useInboxStore.getState().reset();
      useProfileStore.getState().reset();
      useUserDetailsStore.getState().reset();
      useNotificationsStore.getState().reset();
      useUnreadCountStore.getState().reset();
      useLocationsStore.getState().reset();
      usePlansStore.getState().reset();
      useChatMessagesStore.getState().reset();
      useInterestsOptionsStore.getState().reset();
      useQuestionsStore.getState().reset();
      useCommentsStore.getState().reset();
      useBlindDateSessionStore.getState().reset();
      useGoDateDetailsStore.getState().reset();
      useUserInterestsStore.getState().reset();
      useInsightsStore.getState().reset();
    }
  }, [currentUser]);

  // 🔌 socket management
  useEffect(() => {
    if (currentUser?._id) {
      if (!socket.connected) socket.connect();
      socket.emit("join_room", currentUser._id);
    } else {
      if (socket.connected) socket.disconnect();
    }

    return () => {
      socket.off("connect");
    };
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};