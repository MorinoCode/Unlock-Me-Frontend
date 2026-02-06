import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Flame, Compass, Ghost, CalendarHeart } from "lucide-react";
import "./MobileBottomNav.css";

const MobileBottomNav = ({ isVisible }) => {
  const location = useLocation();
  const { t } = useTranslation();

  // ✅ Performance: useMemo for navItems to prevent re-creation
  const navItems = useMemo(
    () => [
      {
        path: "/swipe",
        icon: <Flame size={26} />,
        label: t("nav.swipe") || "Swipe Page",
        ariaLabel: t("nav.swipe") || "Navigate to Swipe Page",
      },
      {
        path: "/explore",
        icon: <Compass size={26} />,
        label: t("nav.explore") || "Explore Page",
        ariaLabel: t("nav.explore") || "Navigate to Explore Page",
      },
      {
        path: "/blind-date",
        icon: <Ghost size={26} />,
        label: t("nav.blindDate") || "Blind Date",
        ariaLabel: t("nav.blindDate") || "Navigate to Blind Date",
      },
      {
        path: "/go-date",
        icon: <CalendarHeart size={26} />,
        label: t("nav.goDate") || "Go Date",
        ariaLabel: t("nav.goDate") || "Navigate to Go Date",
      },
    ],
    [t]
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <Motion.nav
          className="mobile-bottom-nav"
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          role="navigation"
          aria-label={t("nav.bottomNavigation") || "Bottom Navigation"}
        >
          <div className="mobile-bottom-nav__container">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-bottom-nav__item ${
                    isActive ? "mobile-bottom-nav__item--active" : ""
                  }`}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={isActive ? "page" : undefined}
                  role="menuitem"
                  tabIndex={0}
                >
                  <div
                    className={`mobile-bottom-nav__icon-wrapper ${
                      isActive ? "active" : ""
                    }`}
                  >
                    {item.icon}
                    {isActive && (
                      <Motion.div
                        layoutId="nav-bubble"
                        className="mobile-bottom-nav__bubble"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 0.5,
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Motion.nav>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomNav;
