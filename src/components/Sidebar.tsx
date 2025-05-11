import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  LogOut, 
  Menu, 
  X, 
  Award
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, onClick }: NavItemProps) => (
  <NavLink 
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
      ${isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-secondary hover:bg-gray-100'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-30 md:hidden p-2 rounded-md bg-white shadow-md text-text"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        {/* Close button for mobile */}
        <button 
          onClick={closeMobileMenu}
          className="absolute top-4 right-4 md:hidden p-1"
        >
          <X size={20} />
        </button>

        {/* Gym Logo & Title */}
        <div className="flex flex-col items-center gap-2 p-6 border-b">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Award size={32} />
          </div>
          <h1 className="text-xl font-bold text-secondary">FitTrack</h1>
          <p className="text-xs text-text-light">Gym Management System</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-light text-white rounded-full flex items-center justify-center">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-text">{user?.name}</p>
              <p className="text-xs text-text-light capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <NavItem 
            to="/dashboard" 
            icon={<Home size={18} />} 
            label="Dashboard" 
            onClick={closeMobileMenu}
          />
          <NavItem 
            to="/members" 
            icon={<Users size={18} />} 
            label="Members" 
            onClick={closeMobileMenu}
          />
          <NavItem 
            to="/trainers" 
            icon={<Award size={18} />} 
            label="Trainers" 
            onClick={closeMobileMenu}
          />
          <NavItem 
            to="/schedule" 
            icon={<Calendar size={18} />} 
            label="Schedule" 
            onClick={closeMobileMenu}
          />
          <NavItem 
            to="/payments" 
            icon={<DollarSign size={18} />} 
            label="Payments" 
            onClick={closeMobileMenu}
          />
        </nav>
        
        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-text-light hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default Sidebar;