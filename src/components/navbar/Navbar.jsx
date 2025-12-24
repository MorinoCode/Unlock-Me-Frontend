import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("/default-avatar.png");

  // ۱. تمام هوک‌ها باید در بالاترین سطح و بدون قید و شرط اجرا شوند
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (currentUser?._id) {
        try {
          const res = await fetch(`${API_URL}/api/users/user/${currentUser._id}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (data.avatar) setUserAvatar(data.avatar);
          }
        } catch (err) {
          console.error("Error fetching avatar:", err);
        }
      }
    };
    fetchUserAvatar();
  }, [currentUser, API_URL]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Explore", path: "/explore", icon: "🌍" },
    { name: "Matches", path: "/mymatches", icon: "🔥" },
    { name: "Messages", path: "/messages", icon: "💬" },
  ];

  // ۲. حالا که تمام هوک‌ها اجرا شدند، اجازه داریم شرط return را بگذاریم
  if (location.pathname.startsWith("/chat")) {
    return null; 
  }

  return (
    <nav className={`nav-unique-wrapper ${isScrolled ? "nav-unique-scrolled" : ""}`}>
      <div className="nav-unique-container">
        <div className="nav-unique-logoSection">
          <Link to="/" className="nav-unique-logoLink" onClick={() => setMobileMenuOpen(false)}>
            <span className="nav-unique-logoIcon">🔓</span>
            <span className="nav-unique-logoMain">UNLOCK<span className="nav-unique-logoSub">ME</span></span>
          </Link>
        </div>

        <div className={`nav-unique-linksSection ${mobileMenuOpen ? "nav-unique-mobileOpen" : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-unique-linkItem ${location.pathname === link.path ? "nav-unique-active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-unique-linkIcon">{link.icon}</span>
              <span className="nav-unique-linkText">{link.name}</span>
            </Link>
          ))}
          
          {currentUser && (
            <Link 
              to="/myprofile" 
              className={`nav-unique-linkItem nav-unique-mobileOnlyLink ${location.pathname === "/myprofile" ? "nav-unique-active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-unique-linkIcon">👤</span>
              <span className="nav-unique-linkText">My Profile</span>
            </Link>
          )}
        </div>

        <div className="nav-unique-profileSection">
          {currentUser ? (
            <Link to="/myprofile" className="nav-unique-userCard nav-unique-desktopOnlyAvatar">
              <div className="nav-unique-avatarRing">
                <img src={userAvatar} alt="Profile" className="nav-unique-avatarImg" />
              </div>
              <span className="nav-unique-userName">{currentUser.name || "Profile"}</span>
            </Link>
          ) : (
            <Link to="/signin" className="nav-unique-loginBtn">Login</Link>
          )}
          
          <button className="nav-unique-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className={`nav-unique-bar ${mobileMenuOpen ? "nav-unique-bar1" : ""}`}></div>
            <div className={`nav-unique-bar ${mobileMenuOpen ? "nav-unique-bar2" : ""}`}></div>
            <div className={`nav-unique-bar ${mobileMenuOpen ? "nav-unique-bar3" : ""}`}></div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;