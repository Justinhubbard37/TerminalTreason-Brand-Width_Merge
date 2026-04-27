import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({
  className = '',
  variant = 'primary',
  children,
  ...props
}) => {
  const baseClass = "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-neon/10 text-neon border border-neon/50 hover:bg-neon/20 hover:shadow-neon-sm",
    secondary: "bg-panel2 text-platinum border border-border hover:bg-border hover:border-muted",
    ghost: "text-muted hover:text-platinum hover:bg-panel2",
    danger: "bg-danger/10 text-danger border border-danger/50 hover:bg-danger/20"
  };

  return (
    <button className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`w-full bg-void border border-border rounded-md px-3 py-2 text-sm text-platinum placeholder-muted focus:outline-none focus:border-neon focus:shadow-neon-sm transition-colors ${className}`}
    {...props}
  />
);

export const Badge: React.FC<{ children: React.ReactNode, type?: 'success' | 'warning' | 'info' }> = ({ children, type = 'info' }) => {
  const colors = {
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    info: 'text-neon bg-neon/10 border-neon/20'
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[type]}`}>
      {children}
    </span>
  );
};