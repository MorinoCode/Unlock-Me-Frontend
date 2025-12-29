import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import { 
  Compass, Heart, MessageSquare, Ghost, 
  Info, Settings, LogOut, Menu, X, User, Key, 
  Flame, StickyNote 
} from "lucide-react";
import "./Navbar.css";
import defaultAvatar from "../../assets/default-avatar.png";

const Navbar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatar, setAvatar] = useState(defaultAvatar);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastY && y > 100);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!currentUser?._id) return;
    fetch(`${API_URL}/api/user/user/${currentUser._id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => d.avatar && setAvatar(d.avatar));
  }, [currentUser, API_URL]);

  const signout = async () => {
    await fetch(`${API_URL}/api/user/signout`, { method: "POST", credentials: "include" });
    setCurrentUser(null);
    setMobileOpen(false);
    navigate("/");
  };

  const noNavPaths = ["/chat", "/initial"];
  if (noNavPaths.some(path => location.pathname.startsWith(path))) return null;

  // لیست روت‌های هوشمند
  const links = currentUser
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
          />
        )}
      </AnimatePresence>

      <Motion.nav
        className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
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

          {/* منوی دسکتاپ */}
          <div className="navbar__menu navbar__menu--desktop">
            {links.map(l => (
              <Link 
                key={l.to} 
                to={l.to} 
                className={`navbar__link ${location.pathname === l.to ? "navbar__link--active" : ""}`}
              >
                {l.icon}
                <span className="navbar__label">{l.label}</span>
                {location.pathname === l.to && (
                  <Motion.div layoutId="activeNav" className="navbar__active-indicator" />
                )}
              </Link>
            ))}
          </div>

          <div className="navbar__actions">
            {currentUser ? (
              <div className="navbar__user-section">
                <Link to="/myprofile" className="navbar__profile navbar__profile--desktop">
                  <div className="navbar__avatar-wrapper">
                    <img src={avatar} alt="Profile" className="navbar__profile-avatar" />
                    <div className="navbar__status-dot" />
                  </div>
                  <span className="navbar__profile-name">{currentUser.name}</span>
                </Link>
                <button onClick={signout} className="navbar__icon-btn navbar__icon-btn--logout navbar__icon-btn--desktop">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/signin" className="navbar__btn-login navbar__btn-login--desktop">
                <Key size={18} />
                <span>Sign In</span>
              </Link>
            )}

            {/* دکمه همبرگری موبایل */}
            <button className="navbar__burger" onClick={() => setMobileOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* سایدبار موبایل */}
        <AnimatePresence>
          {mobileOpen && (
            <Motion.div 
              className="navbar__sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="navbar__sidebar-content">
                <div className="navbar__sidebar-header">
                  <span>Navigation</span>
                  <button className="navbar__close-btn" onClick={() => setMobileOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                {currentUser && (
                  <Link to="/myprofile" className="navbar__sidebar-profile" onClick={() => setMobileOpen(false)}>
                    <img src={avatar} alt="User" />
                    <div className="navbar__sidebar-user-info">
                      <span className="navbar__sidebar-name">{currentUser.name}</span>
                      <span className="navbar__sidebar-status">Active Now</span>
                    </div>
                  </Link>
                )}

                <div className="navbar__sidebar-links">
                  {links.map(l => (
                    <Link 
                      key={l.to} 
                      to={l.to} 
                      onClick={() => setMobileOpen(false)}
                      className={`navbar__sidebar-link ${location.pathname === l.to ? "navbar__sidebar-link--active" : ""}`}
                    >
                      {l.icon}
                      <span>{l.label}</span>
                    </Link>
                  ))}
                  
                  <div className="navbar__sidebar-divider" />

                  {currentUser ? (
                    <button onClick={signout} className="navbar__sidebar-link navbar__sidebar-link--danger">
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <Link to="/signin" onClick={() => setMobileOpen(false)} className="navbar__sidebar-link">
                      <Key size={20} />
                      <span>Sign In</span>
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