import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  CreditCard, 
  Settings,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: false },
    { path: '/transfers', label: 'Transferências', icon: ArrowLeftRight, locked: false },
    { path: '/investments', label: 'Investimentos', icon: TrendingUp, locked: true },
    { path: '/cards', label: 'Cartões', icon: CreditCard, locked: true },
    { path: '/settings', label: 'Configurações', icon: Settings, locked: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="top-0 left-0 fixed flex flex-col bg-sidebar border-border border-r w-60 h-screen">
      {/* Logo */}
      <div className="p-6 border-border border-b">
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-primary rounded-lg w-10 h-10">
            <span className="font-bold text-white text-xl">F</span>
          </div>
          <span className="font-bold text-foreground text-xl">Fintech Pro</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          if (item.locked) {
            return (
              <div
                key={item.path}
                className="flex justify-between items-center opacity-60 px-4 py-3 rounded-lg text-muted-foreground cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Lock className="w-4 h-4" />
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-border border-t">
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-muted rounded-full w-10 h-10 overflow-hidden">
            {currentUser?.avatar ? (
              <img 
                src={pb.files.getUrl(currentUser, currentUser.avatar)} 
                alt={currentUser.name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-semibold text-foreground">
                {currentUser?.name?.charAt(0) || 'R'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">
              {currentUser?.name || 'Ricardo Silva'}
            </p>
            <p className="text-secondary text-xs truncate">
              {currentUser?.email || 'ricardo@finance.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;