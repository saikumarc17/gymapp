import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
  isLoading: boolean;
}

const DashboardLayout = ({ isLoading }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-0 md:ml-64 pt-16 md:pt-0">
        <div className={`p-6 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;