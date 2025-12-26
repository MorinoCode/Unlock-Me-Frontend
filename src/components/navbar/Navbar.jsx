import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import "./Navbar.css";
import defaultAvatar from "../../assets/default-avatar.png"

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
    let t;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > lastY && y > 80);
      lastY = y;
      clearTimeout(t);
      t = setTimeout(() => setHidden(false), 140);
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
    navigate("/");
  };

  if (location.pathname.startsWith("/chat")) return null;
  if (location.pathname.startsWith("/initial")) return null;

  const links = currentUser
    ? [
        { to: "/explore", label: "Explore", icon: "🌍" },
        { to: "/mymatches", label: "Matches", icon: "🔥" },
        { to: "/messages", label: "Messages", icon: "💬" },
      ]
    : [
        { to: "/how-it-works", label: "How it works", icon: "⚙️" },
        { to: "/about", label: "About", icon: "ℹ️" },
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
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="navbar__container">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-text navbar__logo-text--main">UNLOCK</span>
            <span className="navbar__logo-text navbar__logo-text--sub">ME</span>
          </Link>

          <div className={`navbar__menu ${mobileOpen ? "navbar__menu--open" : ""}`}>
            {links.map(l => (
              <Link 
                key={l.to} 
                to={l.to} 
                onClick={() => setMobileOpen(false)}
                className={`navbar__link ${location.pathname === l.to ? "navbar__link--active" : ""}`}
              >
                {l.icon && <span className="navbar__icon" style={{ marginRight: '6px' }}>{l.icon}</span>}
                <span className="navbar__label">{l.label}</span>
              </Link>
            ))}

            {currentUser ? (
              <button onClick={signout} className="navbar__link navbar__link--logout">
                <span className="navbar__icon" style={{ marginRight: '6px' }}>🚪</span>
                <span className="navbar__label">Logout</span>
              </button>
            ) : (
              <Link to="/signin" onClick={() => setMobileOpen(false)} className="navbar__link navbar__link--login">
                <span className="navbar__icon" style={{ marginRight: '6px' }}>🔑</span>
                <span className="navbar__label">Login</span>
              </Link>
            )}
          </div>

          <div className="navbar__actions">
            {currentUser && (
              <Link to="/myprofile" className="navbar__profile">
                <img src={avatar} alt="" className="navbar__profile-avatar" />
                <span className="navbar__profile-name">{currentUser.name}</span>
              </Link>
            )}

            <button className="navbar__burger" onClick={() => setMobileOpen(s => !s)}>
              <span className="navbar__burger-line" />
              <span className="navbar__burger-line" />
              <span className="navbar__burger-line" />
            </button>
          </div>
        </div>
      </Motion.nav>
    </>
  );
};

export default Navbar;