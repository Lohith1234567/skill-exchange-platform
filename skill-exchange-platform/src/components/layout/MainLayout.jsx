import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Navbar />
      <main className="flex-1 bg-transparent">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
