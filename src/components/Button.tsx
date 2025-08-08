import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'therapeutic' | 'mood' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-card hover:scale-105',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-card',
    therapeutic: 'bg-gradient-primary text-white shadow-soft hover:shadow-therapeutic hover:scale-105',
    mood: 'bg-card border-2 border-border hover:border-primary shadow-soft hover:shadow-therapeutic hover:scale-105',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;