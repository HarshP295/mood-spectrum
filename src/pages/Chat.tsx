import { useState, useRef, useEffect } from 'react';
import { Send, Users, Shield, Hash } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import Button from '../components/Button';
import Card from '../components/Card';
import { useChat } from '../contexts/ChatContext';

const Chat = () => {
  const { state: chatState, sendMessage, joinRoom } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAvatarLetter = (sender: string, index: number) => {
    if (sender === 'user') return 'You';
    const letters = 'A';
    return letters[index % letters.length];
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 therapeutic-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Anonymous Peer Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with others in a safe, anonymous environment. Share experiences and find support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Rooms Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="default" className="p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Support Rooms</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {chatState.onlineUsers} online
                </div>
              </div>
              
              <div className="space-y-2">
                {chatState.rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => joinRoom(room.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      chatState.currentRoom === room.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4" />
                        <span className="font-medium text-sm">{room.name}</span>
                      </div>
                      <span className="text-xs opacity-70">{room.memberCount}</span>
                    </div>
                    <p className="text-xs opacity-70 mt-1 line-clamp-1">
                      {room.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Safety Notice */}
              <div className="mt-6 p-4 bg-muted rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Safe Space</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is a moderated, anonymous space. Please be respectful and supportive. 
                  If you need immediate help, contact emergency services.
                </p>
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card variant="default" className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {chatState.rooms.find(r => r.id === chatState.currentRoom)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {chatState.rooms.find(r => r.id === chatState.currentRoom)?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{chatState.onlineUsers} online</span>
                    <div className={`w-2 h-2 rounded-full ${
                      chatState.isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatState.loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Connecting to chat...</p>
                    </div>
                  </div>
                ) : chatState.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Start the conversation</h3>
                      <p className="text-muted-foreground">Be the first to share and connect with others.</p>
                    </div>
                  </div>
                ) : (
                  chatState.messages.map((message, index) => (
                    <ChatBubble
                      key={message.id}
                      isUser={message.sender === 'user'}
                      timestamp={formatTimestamp(message.timestamp)}
                      avatar={message.sender === 'user' ? 'You' : getAvatarLetter(message.sender, index)}
                    >
                      {message.content}
                    </ChatBubble>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts or ask for support..."
                    className="input-therapeutic flex-1 resize-none min-h-[80px] max-h-32"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    variant="therapeutic"
                    disabled={!newMessage.trim() || !chatState.isConnected}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {!chatState.isConnected && (
                  <p className="text-sm text-destructive mt-2">
                    Disconnected from chat. Trying to reconnect...
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{newMessage.length}/500</span>
                </div>
              </div>
            </Card>

            {/* Community Guidelines */}
            <Card variant="default" className="mt-6 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Community Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Be Respectful</h4>
                  <p>Treat everyone with kindness and respect. We're all here to support each other.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Stay Anonymous</h4>
                  <p>Don't share personal information. Keep conversations general and supportive.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">No Medical Advice</h4>
                  <p>Share experiences, not medical advice. Encourage professional help when needed.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Crisis Support</h4>
                  <p>If you're in crisis, please contact emergency services or a crisis hotline immediately.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;