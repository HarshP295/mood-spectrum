import { useState, useRef, useEffect } from 'react';
import { Send, Users, Heart, MessageCircle } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import Button from '../components/Button';
import Card from '../components/Card';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
  avatar?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hi everyone! I'm feeling a bit anxious about starting a new job next week. Any advice?",
      isUser: false,
      timestamp: "2:30 PM",
      avatar: "A"
    },
    {
      id: 2,
      content: "That's totally normal! I felt the same way. Remember that they hired you for a reason - you've got this! 💪",
      isUser: false,
      timestamp: "2:32 PM",
      avatar: "B"
    },
    {
      id: 3,
      content: "Thank you! That really helps to hear. Sometimes we just need that reminder.",
      isUser: false,
      timestamp: "2:35 PM",
      avatar: "A"
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState(12);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      content: newMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate responses from other users
    setTimeout(() => {
      const responses = [
        "Thank you for sharing that. You're very brave!",
        "I completely understand how you're feeling.",
        "That's a great perspective. Thanks for the insight!",
        "Sending positive vibes your way! 🌟",
        "We're all here to support each other. ❤️"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: Message = {
        id: Date.now() + 1,
        content: randomResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        avatar: String.fromCharCode(65 + Math.floor(Math.random() * 26))
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const supportTopics = [
    "I'm feeling overwhelmed today",
    "Looking for study motivation",
    "Dealing with social anxiety",
    "Need someone to talk to",
    "Celebrating a small win!"
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 therapeutic-pulse">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Peer Support Chat</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with others in a safe, anonymous environment where everyone understands.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Online Users */}
            <Card variant="default" className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Community</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">{onlineUsers} people online</span>
              </div>
            </Card>

            {/* Quick Topics */}
            <Card variant="therapeutic" className="p-6">
              <h3 className="font-semibold text-white mb-4">Quick Topics</h3>
              <div className="space-y-2">
                {supportTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(topic)}
                    className="w-full text-left p-3 bg-white/20 rounded-lg text-white/90 hover:bg-white/30 transition-colors duration-200 text-sm"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </Card>

            {/* Community Guidelines */}
            <Card variant="default" className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Guidelines</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be kind and supportive</li>
                <li>• Respect privacy</li>
                <li>• No judgment zone</li>
                <li>• Listen actively</li>
                <li>• Share your experiences</li>
              </ul>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card variant="default" className="flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-foreground">Anonymous Support Chat</h3>
                <p className="text-sm text-muted-foreground">Everyone here understands what you're going through</p>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    avatar={message.avatar}
                  >
                    {message.content}
                  </ChatBubble>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-border">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message... (Press Enter to send)"
                      className="input-therapeutic w-full h-12 resize-none"
                      rows={1}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    variant="therapeutic"
                    disabled={!newMessage.trim()}
                    className="px-4"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your identity is completely anonymous. Share what feels comfortable.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;