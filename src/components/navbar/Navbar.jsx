import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/useAuth.js";
import { useSocket } from "../../context/useSocket.js"; 
import {
  Compass, Heart, MessageSquare, Ghost, Info, Settings, LogOut, Menu, X, Key, Flame, StickyNote, Bell
} from "lucide-react";
import "./Navbar.css";
import defaultAvatar from "../../assets/default-avatar.png";

const Navbar = ({ isVisible }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // مانیتور اسکرول فقط برای استایل Navbar--scrolled (تار شدن پس‌زمینه)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // دریافت نوتیفیکیشن‌ها
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await fetch(`${API_URL}/api/notifications`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setNotifications(data.notifications || []);
          const unread = data.notifications.filter(n => !n.isRead).length;
          setNotificationsCount(unread);
        }
      } catch (err) { console.error("Error loading notifications:", err); }
    };
    fetchNotifications();
  }, [currentUser, API_URL]);

  // سینک آواتار
  useEffect(() => {
    if (!currentUser?._id) return;
    fetch(`${API_URL}/api/user/user/${currentUser._id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.avatar && setAvatar(d.avatar));
  }, [currentUser, API_URL]);

  // بستن دراپ‌داون با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // گوش دادن به سوکت
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (data) => {
      setNotificationsCount((prev) => prev + 1);
      setNotifications((prev) => [data, ...prev].slice(0, 15));
    };
    socket.on("new_notification", handleNewNotif);
    return () => socket.off("new_notification", handleNewNotif);
  }, [socket]);

  const handleNotificationClick = async (notif) => {
    setShowDropdown(false);
    try {
      await fetch(`${API_URL}/api/notifications/mark-read/${notif._id}`, { method: 'PATCH', credentials: "include" });
    } catch (err) { console.log(err); }

    switch (notif.type) {
      case "NEW_MESSAGE": case "MESSAGE": navigate(`/chat/${notif.targetId}`); break;
      case "NEW_COMMENT": case "LIKE": case "COMMENT": navigate(`/feed`); break;
      case "MATCH": navigate(`/mymatches`); break;
      case "BLIND_MESSAGE": navigate(`/blind-date`); break;
      default: break;
    }
  };

  const signout = async () => {
    try {
      await fetch(`${API_URL}/api/user/signout`, { method: "POST", credentials: "include" });
      setCurrentUser(null);
      localStorage.removeItem("unlock-me-user");
      setMobileOpen(false);
      navigate("/");
    } catch (err) { console.error(err); }
  };

  const noNavPaths = ["/chat", "/initial"];
  if (noNavPaths.some((path) => location.pathname.startsWith(path))) return null;

  const allLinks = currentUser
    ? [
        { to: "/swipe", label: "Swipe", icon: <Flame size={20} /> },
        { to: "/feed", label: "Posts", icon: <StickyNote size={20} /> },
        { to: "/explore", label: "Explore", icon: <Compass size={20} /> },
        { to: "/mymatches", label: "Matches", icon: <Heart size={20} /> },
        { to: "/messages", label: "Messages", icon: <MessageSquare size={20} /> },
        { to: "/blind-date", label: "BlindDate", icon: <Ghost size={20} /> },
      ]
    : [
        { to: "/how-it-works", label: "How it works", icon: <Settings size={20} /> },
        { to: "/about-us", label: "About", icon: <Info size={20} /> },
      ];

  const sidebarLinks = currentUser 
    ? allLinks.filter(l => !["/swipe", "/explore", "/blind-date", "/messages"].includes(l.to))
    : allLinks;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div className="navbar__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <Motion.nav 
        className={`navbar ${scrolled ? "navbar--scrolled" : ""}`} 
        initial={{ y: 0 }} 
        animate={{ y: isVisible ? 0 : -100 }} 
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="navbar__container">
          <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
            <div className="navbar__logo-icon">U</div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-text--main">UNLOCK</span>
              <span className="navbar__logo-text--sub">ME</span>
            </div>
          </Link>

          <div className="navbar__menu navbar__menu--desktop">
            {allLinks.map((l) => (
              <Link key={l.to} to={l.to} className={`navbar__link ${location.pathname === l.to ? "navbar__link--active" : ""}`}>
                {l.icon}<span className="navbar__label">{l.label}</span>
                {/* بخش اصلاح شده: حذف layoutId برای جلوگیری از لغزش */}
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
                <div className="navbar__notification-wrapper" onClick={() => {setShowDropdown(!showDropdown); setNotificationsCount(0)}}>
                  <Bell size={22} className="navbar__notification-icon" />
                  {notificationsCount > 0 && <span className="navbar__notification-badge">{notificationsCount}</span>}
                </div>
                <AnimatePresence>
                  {showDropdown && (
                    <Motion.div className="navbar__dropdown" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>
                      <div className="navbar__dropdown-header"><span>Notifications</span></div>
                      <div className="navbar__dropdown-list">
                        {notifications.length > 0 ? (
                          notifications.map((n, idx) => (
                            <div key={idx} className="navbar__dropdown-item" onClick={() => handleNotificationClick(n)}>
                               <div className="navbar__dropdown-avatar">
                                  {n.senderAvatar ? <img src={n.senderAvatar} alt=""/> : "👤"}
                               </div>
                               <div className="navbar__dropdown-info">
                                  <p><strong>{n.senderName}</strong> {n.message}</p>
                               </div>
                            </div>
                          ))
                        ) : (<div className="navbar__dropdown-empty">No notifications</div>)}
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {currentUser ? (
              <div className="navbar__user-section navbar__user-section--desktop">
                <Link to="/myprofile" className="navbar__profile">
                  <div className="navbar__avatar-wrapper"><img src={avatar} alt="Profile" className="navbar__profile-avatar" /></div>
                  <span className="navbar__profile-name">{currentUser.name}</span>
                </Link>
                <button onClick={signout} className="navbar__icon-btn--logout"><LogOut size={20} /></button>
              </div>
            ) : (
              <Link to="/signin" className="navbar__btn-login navbar__btn-login--desktop"><Key size={18} /><span>Sign In</span></Link>
            )}

            <button className="navbar__burger" onClick={() => setMobileOpen(true)}><Menu size={28} /></button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <Motion.div className="navbar__sidebar" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
              <div className="navbar__sidebar-content">
                <div className="navbar__sidebar-header"><span>Navigation</span><button className="navbar__close-btn" onClick={() => setMobileOpen(false)}><X size={24} /></button></div>
                {currentUser && (
                  <div className="navbar__sidebar-user-card" onClick={() => {navigate("/myprofile"); setMobileOpen(false)}} >
                    <img src={avatar} alt="User" className="navbar__sidebar-avatar" />
                    <div className="navbar__sidebar-info">
                      <span className="navbar__sidebar-name">{currentUser.name}</span>
                      <span className="navbar__sidebar-status">Active Now</span>
                    </div>
                  </div>
                )}
                <div className="navbar__sidebar-links">
                  {sidebarLinks.map((l) => (
                    <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`navbar__sidebar-link ${location.pathname === l.to ? "navbar__sidebar-link--active" : ""}`}>
                      {l.icon} <span>{l.label}</span>
                      {/* بخش اصلاح شده: حذف layoutId برای سایدبار */}
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
                  {currentUser ? (
                    <button onClick={signout} className="navbar__sidebar-logout"><LogOut size={20} /> <span>Logout</span></button>
                  ) : (
                    <Link to="/signin" className="navbar__sidebar-link" onClick={() => setMobileOpen(false)}><Key size={20} /> <span>Sign In</span></Link>
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