import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar.jsx';
import Footer from '../components/footer/Footer.jsx';

const MainLayout = () => {
  const location = useLocation();

  // List of routes where Footer should be hidden
  const noFooterRoutes = ['/chat',"/swipe","/blind-date"]; // We'll check startsWith for dynamic routes

  const hideFooter = noFooterRoutes.some(path => location.pathname.startsWith(path));

  return (
    <>
      <Navbar />
      <Outlet />
      {!hideFooter && <Footer />}
    </>
  );
};

export default MainLayout;
