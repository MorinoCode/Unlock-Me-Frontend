import { useState, useEffect } from 'react';
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

  // ۱. منطق تشخیص اسکرول برای مخفی/ظاهر شدن Navbar و BottomNav
  useEffect(() => {
    const controlNavbars = () => {
      if (typeof window !== 'undefined') {
        const currentY = window.scrollY;
        
        // اگر به سمت پایین اسکرول کرد و بیشتر از ۸۰ پیکسل رفت -> مخفی کن
        if (currentY > lastScrollY && currentY > 80) {
          setNavVisible(false);
        } 
        // اگر به سمت بالا اسکرول کرد -> ظاهر کن
        else {
          setNavVisible(true);
        }
        setLastScrollY(currentY);
      }
    };

    window.addEventListener('scroll', controlNavbars);
    return () => window.removeEventListener('scroll', controlNavbars);
  }, [lastScrollY]);

  // منطق شما برای مخفی کردن فوتر در مسیرهای خاص (بدون تغییر)
  const noFooterRoutes = ['/chat', "/swipe", "/blind-date" , "/explore"];
  const hideFooter = noFooterRoutes.some(path => location.pathname.startsWith(path));

  // مسیرهایی که نوار پایین نباید باشد
  const noBottomNavRoutes = ['/chat', '/initial'];
  const hideBottomNav = noBottomNavRoutes.some(path => location.pathname.startsWith(path));

  return (
    // اضافه کردن استایل پس‌زمینه تیره به کانتینر اصلی برای حذف فاصله سفید
    <div className="layout-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', position: 'relative' }}>
      <Navbar isVisible={navVisible} />
      
      {/* اضافه شدن کلاس with-bottom-nav برای مدیریت فضای پایین محتوا */}
      <main className={`main-content ${currentUser && !hideBottomNav ? 'with-bottom-nav' : ''}`}>
        <Outlet />
      </main>

      {/* نوار پایین مخصوص موبایل */}
      {currentUser && !hideBottomNav && (
        <MobileBottomNav isVisible={navVisible} />
      )}

      {/* نمایش فوتر بر اساس منطق hideFooter شما */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;