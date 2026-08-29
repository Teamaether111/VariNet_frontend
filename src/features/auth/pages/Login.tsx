import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  MapPin, 
  Radio, 
  Layers, 
  CheckCircle2, 
  Compass, 
  Users, 
  Building2,
  Lock,
  Globe,
  Languages
} from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../authContext';
import { authService } from '../authService';
import { Logo } from '../../../components/common/Logo';
import { useLanguage } from '../../../context/LanguageContext';

export const Login: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to their role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = authService.getRolePath(user.role);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A2B47] flex flex-col justify-between selection:bg-orange-200 selection:text-[#1A2B47]">
      
      {/* Top Simple Brand Bar */}
      <header className="w-full bg-[#1A2B47] text-white py-3.5 px-4 sm:px-6 border-b border-[#243b61]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <span className="font-extrabold text-base tracking-tight uppercase">
                VARI-Net <span className="font-light opacity-70">Auth Portal</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Simple English <-> Marathi Toggle */}
            <div 
              id="login-header-language-toggle"
              className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 min-h-[44px]"
              title="Toggle Language: English / मराठी"
            >
              <button
                type="button"
                id="login-lang-en"
                onClick={() => setLanguage('en')}
                className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 duration-150 ${
                  language === 'en'
                    ? 'bg-[#F27D26] text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>English</span>
              </button>
              <button
                type="button"
                id="login-lang-mr"
                onClick={() => setLanguage('mr')}
                className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 duration-150 ${
                  language === 'mr'
                    ? 'bg-[#F27D26] text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>मराठी</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-white/80 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>{t('app.location', 'Pandharpur Wari')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Bento Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Hero & Role Overview Bento Card (Desktop/Tablet) */}
          <div className="lg:col-span-5 bg-[#1A2B47] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-[#243b61] relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#F27D26]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-6">
              {/* Logo & Headline */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Logo size="lg" className="shadow-lg shadow-black/20" />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/15">
                      <Sparkles className="w-3 h-3 text-[#F27D26]" />
                      <span>Decision Engine</span>
                    </div>
                    <div className="text-xs text-orange-200/80 font-semibold mt-1">
                      CONNECT • PREDICT • RECOMMEND • PREVENT
                    </div>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Welcome to <br />
                  <span className="text-[#F27D26]">VARI-Net</span> Command
                </h1>
                
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Unified crowd safety, microclimate telemetry, real-time AI rerouting, and multi-agency coordination for the Pandharpur Wari pilgrimage.
                </p>
              </div>

              {/* 4 Role Systems List */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Selectable Role Dashboards:
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <Shield className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Police Command:</span>
                      <span className="text-gray-300 ml-1">AI intervention approval, GIS incident triage & unit dispatch.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <Users className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Volunteer Field Ops:</span>
                      <span className="text-gray-300 ml-1">Task execution, water/ORS distribution & 10s incident reports.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <Compass className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Pilgrim App:</span>
                      <span className="text-gray-300 ml-1">Safe route guidance, shaded corridors, water finder & SOS distress.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <Building2 className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Temple Authority:</span>
                      <span className="text-gray-300 ml-1">Holding mandap capacities, sanctum throughput & queue pacing.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Info */}
            <div className="relative pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Role-Based Access Control</span>
              </div>
              <span>MVP Secure Session</span>
            </div>
          </div>

          {/* Right Login Form Bento Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-lg flex flex-col justify-center">
            <div className="mb-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F27D26]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Secure Access Portal
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A2B47]">
                Sign In to Your Station
              </h2>
              <p className="text-xs text-gray-500">
                Enter your identity details and select your operational role to access your dedicated dashboard.
              </p>
            </div>

            {/* Reusable Form */}
            <LoginForm />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-[#E5E5E5] bg-white">
        <span>VARI-Net Crowd Intelligence System • Solapur District Administration & Mandir Samiti</span>
      </footer>
    </div>
  );
};
