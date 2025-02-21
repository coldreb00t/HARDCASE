import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  menuItems: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }[];
  backTo?: string;
  onBack?: () => void;
}

export function SidebarLayout({ children, title, menuItems, backTo, onBack }: SidebarLayoutProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/login');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      setIsSidebarOpen(false);
    } else if (backTo) {
      navigate(backTo);
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-50 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-50
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            {(backTo || onBack) && (
              <button 
                onClick={handleBack}
                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-500"
              >
                <ChevronLeft className="w-5 h-5 min-w-[20px]" />
                <span className="ml-3">Назад</span>
              </button>
            )}

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-500"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-500"
            >
              <LogOut className="w-5 h-5 min-w-[20px]" />
              <span className="ml-3">Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 p-4">
        {children}
      </div>
    </div>
  );
}