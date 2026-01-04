import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Flame, Compass, Ghost, MessageSquare } from "lucide-react";
import "./MobileBottomNav.css";

const MobileBottomNav = ({ isVisible }) => {
  const location = useLocation();

  const navItems = [
    { path: "/swipe", icon: <Flame size={26} /> },
    { path: "/explore", icon: <Compass size={26} /> },
    { path: "/blind-date", icon: <Ghost size={26} /> },
    { path: "/messages", icon: <MessageSquare size={26} /> },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <Motion.div
          className="mobile-bottom-nav"
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="mobile-bottom-nav__container">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="mobile-bottom-nav__item">
                  <div className={`mobile-bottom-nav__icon-wrapper ${isActive ? "active" : ""}`}>
                    {item.icon}
                    {isActive && (
                      <Motion.div
                        layoutId="nav-bubble"
                        className="mobile-bottom-nav__bubble"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomNav;