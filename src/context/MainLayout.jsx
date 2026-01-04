import { useState, useEffect } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar.jsx';
import Footer from '../components/footer/Footer.jsx';
import MobileBottomNav from '../components/mobileBottomNav/MobileBottomNav.jsx';
import { useAuth } from "../context/useAuth.js";

const MainLayout = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // مدیریت اسکرول برای کل لایوت
  useEffect(() => {
    const controlNavbar = () => {
      const currentY = window.scrollY;
      // اگر اسکرول به پایین بود و بیشتر از ۱۰۰ پیکسل حرکت کرد، نوارها مخفی شوند
      if (currentY > lastScrollY && currentY > 100) {
        setNavVisible(false);
      } else if (currentY < lastScrollY) {
        // با اسکرول به سمت بالا، نوارها ظاهر شوند
        setNavVisible(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // مسیرهایی که نوار موبایل نباید در آن‌ها نمایش داده شود
  const noBottomNavRoutes = ['/chat', '/initial'];
  const hideBottomNav = noBottomNavRoutes.some(path => location.pathname.startsWith(path));

  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* پاس دادن وضعیت دید به Navbar اصلی */}
      <Navbar isVisible={navVisible} />
      
      {/* کلاس with-bottom-nav برای مدیریت Padding پایین در موبایل استفاده می‌شود */}
      <main className={`main-content ${currentUser && !hideBottomNav ? 'with-bottom-nav' : ''}`}>
        <Outlet />
      </main>

      {/* نمایش نوار پایین مخصوص موبایل در صورت لاگین بودن و نبودن در مسیرهای ممنوعه */}
      {currentUser && !hideBottomNav && (
        <MobileBottomNav isVisible={navVisible} />
      )}

      <Footer /> 
    </div>
  );
};

export default MainLayout;