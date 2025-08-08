import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'therapeutic' | 'mood' | 'gradient';
  hover?: boolean;
}

const Card = ({ 
  children, 
  className, 
  variant = 'default', 
  hover = true,
  ...props
}: CardProps) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-card border border-border shadow-soft',
    therapeutic: 'bg-gradient-therapeutic border-0 shadow-therapeutic',
    mood: 'bg-card border-2 border-border shadow-soft hover:border-primary',
    gradient: 'bg-gradient-primary text-white shadow-card'
  };
  
  const hoverClasses = hover ? 'hover:shadow-card hover:scale-105' : '';

  return (
    <div 
      className={cn(
        baseClasses,
        variants[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;