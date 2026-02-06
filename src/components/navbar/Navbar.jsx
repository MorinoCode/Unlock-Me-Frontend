import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth.js";
import { useSocket } from "../../context/useSocket.js";
import {
  Compass,
  Heart,
  MessageSquare,
  Ghost,
  Info,
  Settings,
  LogOut,
  Menu,
  X,
  Key,
  Flame,
  StickyNote,
  Bell,
  CalendarHeart,
} from "lucide-react";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import { useNotificationsStore } from "../../store/notificationsStore";
import { useUnreadCountStore } from "../../store/unreadCountStore";
import { useProfileStore } from "../../store/profileStore";
import "./Navbar.css";
import defaultAvatar from "../../assets/default-avatar.png";

// نوتیف پیام/چت فقط روی آیکون Messages نمایش داده می‌شود، در لیست نوتیفیکیشن نه
const MESSAGE_NOTIF_TYPES = [
  "NEW_MESSAGE",
  "MESSAGE",
  "NEW_REQUEST",
  "REQUEST_ACCEPTED",
];
const isMessageNotif = (type) =>
  type && MESSAGE_NOTIF_TYPES.includes(String(type).trim());

const Navbar = ({ isVisible }) => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Mobile: Prevent body scroll when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("navbar-sidebar-open");
    } else {
      document.body.classList.remove("navbar-sidebar-open");
    }
    return () => {
      document.body.classList.remove("navbar-sidebar-open");
    };
  }, [mobileOpen]);
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCountCached = useUnreadCountStore((s) => s.getCached());
  const unreadMessagesCount = useUnreadCountStore((s) => s.count);
  const unreadFetch = useUnreadCountStore((s) => s.fetchUnreadCount);
  const unreadIncrement = useUnreadCountStore((s) => s.increment);

  const notifList = useNotificationsStore((s) => s.list);
  const notifGetCached = useNotificationsStore((s) => s.getCached);
  const notifFetch = useNotificationsStore((s) => s.fetchNotifications);
  const notifInvalidate = useNotificationsStore((s) => s.invalidate);
  const notifPrepend = useNotificationsStore((s) => s.prependNotification);
  const notifications = useMemo(
    () => (Array.isArray(notifList) ? notifList : []).filter((n) => !isMessageNotif(n?.type)),
    [notifList]
  );
  const notificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Resolve notification sender avatar: full URL, or API base + path, or default
  const getNotificationAvatar = useCallback(
    (avatar) => {
      if (!avatar || typeof avatar !== "string") return defaultAvatar;
      if (avatar.startsWith("http://") || avatar.startsWith("https://"))
        return avatar;
      const base = API_URL?.replace(/\/$/, "") || "";
      return base
        ? `${base}${avatar.startsWith("/") ? "" : "/"}${avatar}`
        : defaultAvatar;
    },
    [API_URL]
  );

  // ✅ Performance: Debounced scroll handler
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    // ✅ Mobile Support: Passive listener for better performance
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!currentUser?._id) return;
    const cached = notifGetCached();
    const silent = !!cached;
    notifFetch(API_URL, silent);
  }, [currentUser?._id, API_URL, notifGetCached, notifFetch]);

  useEffect(() => {
    if (!currentUser?._id || !API_URL) return;
    const cached = unreadCountCached;
    unreadFetch(API_URL, !!cached);
  }, [currentUser?._id, API_URL, unreadCountCached, unreadFetch]);

  useEffect(() => {
    const onFocus = () => unreadFetch(API_URL, false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("refetch-unread-messages", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("refetch-unread-messages", onFocus);
    };
  }, [API_URL, unreadFetch]);

  useEffect(() => {
    if (location.pathname === "/messages" || location.pathname.startsWith("/chat/")) {
      const t = setTimeout(() => unreadFetch(API_URL, false), 2000);
      return () => clearTimeout(t);
    }
  }, [location.pathname, API_URL, unreadFetch]);

  const messagesBadgeCount =
    location.pathname === "/messages" || location.pathname.startsWith("/chat/")
      ? 0
      : (unreadMessagesCount ?? 0);

  useEffect(() => {
    if (!socket) return;
    const onMessage = () => unreadIncrement();
    socket.on("receive_message", onMessage);
    return () => socket.off("receive_message", onMessage);
  }, [socket, unreadIncrement]);

  const profileCacheEntry = useProfileStore(
    (s) => (currentUser?._id ? s.cache[`profile:${currentUser._id}`] : null)
  );
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  useEffect(() => {
    if (!currentUser?._id) return;
    if (profileCacheEntry?.profile?.avatar) {
      queueMicrotask(() => setAvatar(profileCacheEntry.profile.avatar));
      return;
    }
    const ac = new AbortController();
    fetchProfile(API_URL, currentUser._id, true, ac.signal).then(() => {
      const entry = useProfileStore.getState().cache[`profile:${currentUser._id}`];
      if (entry?.profile?.avatar && !ac.signal.aborted) setAvatar(entry.profile.avatar);
    }).catch((err) => {
      if (err?.name !== "AbortError") console.error("Error fetching avatar:", err);
    });
    return () => ac.abort();
  }, [currentUser?._id, API_URL, profileCacheEntry?.profile?.avatar, fetchProfile]);

  // ✅ Mobile Support: Handle click outside with both mouse and touch events
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    // ✅ Mobile Support: Support both mouse and touch events
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (data) => {
      if (isMessageNotif(data?.type)) return;
      notifPrepend(data);
    };
    socket.on("new_notification", handleNewNotif);
    return () => socket.off("new_notification", handleNewNotif);
  }, [socket, notifPrepend]);

  // ✅ Performance: useCallback for handleNotificationClick
  const handleNotificationClick = useCallback(
    async (notif) => {
      if (!notif?._id) return;

      setShowDropdown(false);
      try {
        await fetch(`${API_URL}/api/notifications/mark-read/${notif._id}`, {
          method: "PATCH",
          credentials: "include",
        });
        notifInvalidate();
        notifFetch(API_URL, false);
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }

      switch (notif.type) {
        case "NEW_MESSAGE":
        case "MESSAGE":
          navigate(`/chat/${notif.targetId}`);
          break;
        case "NEW_COMMENT":
        case "LIKE":
        case "COMMENT":
          navigate(`/feed`);
          break;
        case "MATCH":
          navigate(`/mymatches`);
          break;
        case "BLIND_MESSAGE":
          navigate(`/blind-date`);
          break;
        case "DATE_APPLICANT":
        case "DATE_ACCEPTED":
        case "DATE_CANCELLED":
        case "DATE_CLOSED_OTHER":
          navigate(`/go-date`);
          break;
        default:
          break;
      }
    },
    [API_URL, navigate, notifInvalidate, notifFetch]
  );

  // ✅ Performance: useCallback for signout
  const signout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/user/signout`, {
        method: "POST",
        credentials: "include",
      });
      setCurrentUser(null);
      localStorage.removeItem("unlock-me-user");
      setMobileOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Signout error:", err);
    }
  }, [API_URL, setCurrentUser, navigate]);

  // ✅ Performance: useMemo for links (must run every render - no early return before hooks)
  const allLinks = useMemo(() => {
    return currentUser
      ? [
          { to: "/swipe", label: t("nav.swipe"), icon: <Flame size={20} /> },
          {
            to: "/explore",
            label: t("nav.explore"),
            icon: <Compass size={20} />,
          },
          {
            to: "/blind-date",
            label: t("nav.blindDate"),
            icon: <Ghost size={20} />,
          },
          {
            to: "/go-date",
            label: t("nav.goDate"),
            icon: <CalendarHeart size={20} />,
          },
          { to: "/feed", label: t("nav.feed"), icon: <StickyNote size={20} /> },
          {
            to: "/mymatches",
            label: t("nav.matches"),
            icon: <Heart size={20} />,
          },
          {
            to: "/messages",
            label: t("nav.messages"),
            icon: <MessageSquare size={20} />,
          },
        ]
      : [
          {
            to: "/how-it-works",
            label: t("pages.howItWorks.title"),
            icon: <Settings size={20} />,
          },
          {
            to: "/about-us",
            label: t("pages.about.title"),
            icon: <Info size={20} />,
          },
        ];
  }, [currentUser, t]);

  // ✅ Performance: useMemo for sidebarLinks
  // Logic Change:
  // We want 'Messages' in the Sidebar (Hamburger).
  // We want 'Go Date', 'Swipe', 'Explore', 'Blind Date' in Bottom Nav (so remove from Sidebar).
  const sidebarLinks = useMemo(() => {
    return currentUser
      ? allLinks.filter(
          (l) =>
            !["/swipe", "/explore", "/blind-date", "/go-date"].includes(l.to)
        )
      : allLinks;
  }, [currentUser, allLinks]);

  const noNavPaths = ["/chat", "/initial"];
  if (noNavPaths.some((path) => location.pathname.startsWith(path)))
    return null;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            className="navbar__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            onTouchStart={(e) => {
              // ✅ Mobile: Prevent body scroll when sidebar is open
              e.preventDefault();
              setMobileOpen(false);
            }}
            aria-label="Close menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                setMobileOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      <Motion.nav
        className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="navbar__container">
          <Link
            to="/"
            className="navbar__logo"
            onClick={() => setMobileOpen(false)}
            aria-label="UnlockMe Home"
          >
            <div className="navbar__logo-icon">U</div>
          </Link>

          <div className="navbar__menu navbar__menu--desktop">
            {allLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`navbar__link ${
                  location.pathname === l.to ? "navbar__link--active" : ""
                }`}
                aria-label={
                  l.to === "/messages" && messagesBadgeCount > 0
                    ? `${l.label} (${messagesBadgeCount} unread)`
                    : undefined
                }
              >
                {l.to === "/messages" ? (
                  <span className="navbar__link-icon-wrap">
                    {l.icon}
                    {messagesBadgeCount > 0 && (
                      <span
                        className="navbar__messages-badge"
                        aria-label={`${messagesBadgeCount} unread messages`}
                      >
                        {messagesBadgeCount > 99 ? "99+" : messagesBadgeCount}
                      </span>
                    )}
                  </span>
                ) : (
                  l.icon
                )}
                <span className="navbar__label">{l.label}</span>
                {location.pathname === l.to && (
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="navbar__active-indicator"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="navbar__actions">
            {currentUser && (
              <div className="navbar__notif-container" ref={dropdownRef}>
                <button
                  className="navbar__notification-wrapper"
                  onClick={async () => {
                    const willOpen = !showDropdown;
                    setShowDropdown(willOpen);
                    if (willOpen && notificationsCount > 0) {
                      try {
                        await fetch(
                          `${API_URL}/api/notifications/mark-all-read`,
                          {
                            method: "PATCH",
                            credentials: "include",
                          }
                        );
                        notifInvalidate();
                        notifFetch(API_URL, false);
                      } catch { /* ignore */ }
                    }
                  }}
                  aria-label={`Notifications ${
                    notificationsCount > 0
                      ? `(${notificationsCount} unread)`
                      : ""
                  }`}
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  <Bell size={22} className="navbar__notification-icon" />
                  {notificationsCount > 0 && (
                    <span
                      className="navbar__notification-badge"
                      aria-label={`${notificationsCount} unread notifications`}
                    >
                      {notificationsCount > 99 ? "99+" : notificationsCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <Motion.div
                      className="navbar__dropdown"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      role="menu"
                      aria-label="Notifications"
                    >
                      <div className="navbar__dropdown-header">
                        <span>{t("nav.notifications") || "Notifications"}</span>
                      </div>
                      <div className="navbar__dropdown-list">
                        {notifications.length > 0 ? (
                          notifications.map((n, idx) => (
                            <div
                              key={n._id || idx}
                              className="navbar__dropdown-item"
                              onClick={() => handleNotificationClick(n)}
                              onTouchStart={(e) => {
                                // ✅ Mobile: Handle touch events
                                e.preventDefault();
                                handleNotificationClick(n);
                              }}
                              role="menuitem"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleNotificationClick(n);
                                }
                              }}
                            >
                              <div className="navbar__dropdown-avatar">
                                <img
                                  src={getNotificationAvatar(n.senderAvatar)}
                                  alt={n.senderName || "User"}
                                  loading="lazy"
                                  onError={(e) => {
                                    if (e.target) {
                                      e.target.onerror = null;
                                      e.target.src = defaultAvatar;
                                    }
                                  }}
                                />
                              </div>
                              <div className="navbar__dropdown-info">
                                <p>
                                  <strong>{n.senderName || "User"}</strong>{" "}
                                  {n.message || ""}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className="navbar__dropdown-empty"
                            role="status"
                            aria-live="polite"
                          >
                            {t("nav.noNotifications") || "No notifications"}
                          </div>
                        )}
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {currentUser ? (
              <div className="navbar__user-section navbar__user-section--desktop">
                <LanguageSwitcher />
                <Link
                  to="/myprofile"
                  className="navbar__profile"
                  aria-label="Go to My Profile"
                >
                  <div className="navbar__avatar-wrapper">
                    <img
                      src={avatar}
                      alt="Profile"
                      className="navbar__profile-avatar"
                    />
                  </div>
                  <span className="navbar__profile-name">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  onClick={signout}
                  className="navbar__icon-btn--logout"
                  aria-label="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <LanguageSwitcher />
                <Link
                  to="/signin"
                  className="navbar__btn-login navbar__btn-login--desktop"
                  aria-label={t("nav.signin")}
                >
                  <Key size={18} />
                  <span>{t("nav.signin")}</span>
                </Link>
              </>
            )}

            <button
              className="navbar__burger"
              onClick={() => setMobileOpen(true)}
              aria-label={t("nav.navigation") || "Open Menu"}
              aria-expanded={mobileOpen}
              aria-controls="navbar-sidebar"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <Motion.div
              className="navbar__sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              id="navbar-sidebar"
              role="navigation"
              aria-label={t("nav.navigation") || "Navigation menu"}
            >
              <div className="navbar__sidebar-content">
                <div className="navbar__sidebar-header">
                  <span>{t("nav.navigation")}</span>
                  <button
                    className="navbar__close-btn"
                    onClick={() => setMobileOpen(false)}
                    aria-label={t("common.close")}
                  >
                    <X size={24} />
                  </button>
                </div>
                {currentUser && (
                  <div
                    className="navbar__sidebar-user-card"
                    onClick={() => {
                      navigate("/myprofile");
                      setMobileOpen(false);
                    }}
                  >
                    <img
                      src={avatar}
                      alt="User"
                      className="navbar__sidebar-avatar"
                    />
                    <div className="navbar__sidebar-info">
                      <span className="navbar__sidebar-name">
                        {currentUser.name}
                      </span>
                      <span className="navbar__sidebar-status">Active Now</span>
                    </div>
                  </div>
                )}
                <div className="navbar__sidebar-links">
                  {sidebarLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`navbar__sidebar-link ${
                        location.pathname === l.to
                          ? "navbar__sidebar-link--active"
                          : ""
                      }`}
                    >
                      {l.to === "/messages" ? (
                        <span className="navbar__link-icon-wrap">
                          {l.icon}
                          {messagesBadgeCount > 0 && (
                            <span className="navbar__messages-badge">
                              {messagesBadgeCount > 99
                                ? "99+"
                                : messagesBadgeCount}
                            </span>
                          )}
                        </span>
                      ) : (
                        l.icon
                      )}{" "}
                      <span>{l.label}</span>
                      {location.pathname === l.to && (
                        <Motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="navbar__active-indicator-mobile"
                        />
                      )}
                    </Link>
                  ))}
                </div>
                <div className="navbar__sidebar-footer">
                  <div className="navbar__sidebar-language">
                    <LanguageSwitcher />
                  </div>
                  {currentUser ? (
                    <button
                      onClick={signout}
                      className="navbar__sidebar-logout"
                      aria-label={t("nav.logout")}
                    >
                      <LogOut size={20} /> <span>{t("nav.logout")}</span>
                    </button>
                  ) : (
                    <Link
                      to="/signin"
                      className="navbar__sidebar-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Key size={20} /> <span>{t("nav.signin")}</span>
                    </Link>
                  )}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.nav>
    </>
  );
};

export default Navbar;
