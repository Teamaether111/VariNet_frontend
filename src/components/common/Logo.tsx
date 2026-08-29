import React from 'react';
import logoImg from '../../assets/images/varinet_logo_1787511208404.jpg';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textVariant?: 'white' | 'dark';
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  textVariant = 'white',
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const imageElement = (
    <img
      src={logoImg}
      alt="VARI-NET Logo"
      referrerPolicy="no-referrer"
      className={`${sizeMap[size]} object-cover rounded-xl shadow-sm border border-white/20 shrink-0 bg-white`}
    />
  );

  if (!showText) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {imageElement}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {imageElement}
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight uppercase leading-none ${
              textVariant === 'white' ? 'text-white' : 'text-[#1A2B47]'
            } ${size === 'lg' || size === 'xl' ? 'text-xl' : 'text-base sm:text-lg'}`}
          >
            VARI-Net
          </span>
        </div>
        {subtitle && (
          <p
            className={`text-[10px] font-medium tracking-wide mt-0.5 ${
              textVariant === 'white' ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export { logoImg };
