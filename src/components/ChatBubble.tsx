import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  children: ReactNode;
  isUser?: boolean;
  timestamp?: string;
  avatar?: string;
}

const ChatBubble = ({ children, isUser = false, timestamp, avatar }: ChatBubbleProps) => {
  return (
    <div className={cn(
      'flex gap-3 mb-4 animate-fade-in',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground'
      )}>
        {avatar || (isUser ? 'You' : 'AI')}
      </div>
      
      {/* Message Content */}
      <div className={cn(
        'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-soft',
        isUser 
          ? 'bg-primary text-primary-foreground rounded-br-md' 
          : 'bg-card text-card-foreground border border-border rounded-bl-md'
      )}>
        <div className="text-sm leading-relaxed">{children}</div>
        {timestamp && (
          <div className={cn(
            'text-xs mt-2 opacity-70',
            isUser ? 'text-primary-foreground' : 'text-muted-foreground'
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;