import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-16 md:ml-[280px]">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f7f9fb]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
