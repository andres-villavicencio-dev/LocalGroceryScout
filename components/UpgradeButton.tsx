import React from 'react';

interface UpgradeButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'nav' | 'banner';
  className?: string;
  showIcon?: boolean;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  onClick,
  variant = 'primary',
  className = '',
  showIcon = true
}) => {
  const baseClasses = "font-semibold transition-all duration-200";

  const variantClasses = {
    primary: "bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg",
    secondary: "bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-2 border-amber-500 dark:border-amber-600 px-6 py-2.5 rounded-full hover:bg-amber-50 dark:hover:bg-gray-700",
    nav: "bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm hover:from-amber-600 hover:to-orange-600 shadow-sm",
    banner: "bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-50 dark:hover:bg-gray-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className} flex items-center gap-2`}
    >
      {showIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )}
      <span>Upgrade to Pro</span>
    </button>
  );
};

export const ProBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      PRO
    </span>
  );
};
