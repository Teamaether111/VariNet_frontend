import React, { ReactNode } from 'react';
import { Navbar } from '../components/common/Navbar';
import { ToastNotifications } from '../components/common/ToastNotifications';
import { useLanguage } from '../context/LanguageContext';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A2B47] flex flex-col font-sans antialiased selection:bg-orange-200 selection:text-[#1A2B47]">
      
      {/* 1. MAIN HEADER & ROLE PROFILE */}
      <Navbar />

      {/* Real-time Actionable Screen Toast Notifications */}
      <ToastNotifications />

      {/* 2. CORE APPLICATION CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* 3. GROUND COMMAND FOOTER */}
      <footer className="bg-white border-t border-[#E5E5E5] py-5 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-[#1A2B47]">VARI-Net AI Decision Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500">
            <span>Sense → Understand → Prioritize → Recommend → Approve → Coordinate → Monitor</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
