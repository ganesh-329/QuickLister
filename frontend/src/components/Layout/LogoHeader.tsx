import React from 'react';

interface LogoHeaderProps {
  className?: string;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ className = '' }) => {
  return (
    <div className={`w-full px-8 py-4 ${className}`}>
      <div className="flex items-center">
        <img src="/images/logo.svg" alt="QuickLister Logo" className="h-8 w-8" />
        <span className="ml-2 text-xl font-bold text-blue-700">QuickLister</span>
      </div>
    </div>
  );
};

export default LogoHeader; 