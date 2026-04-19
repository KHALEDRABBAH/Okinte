'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  inline?: boolean;
}

interface ChatMsg {
  id: string;
  content: string;
  isAdmin: boolean;
  isRead: boolean;
  createdAt: string;
}

export default function ChatPanel({ user, inline = false }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  // Load messages from API
  const loadMessages = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setHasLoaded(true);
    }
  }, [user]);

  // Load on open/mount
  useEffect(() => {
    if ((isOpen || inline) && user && !hasLoaded) {
      loadMessages();
    }
  }, [isOpen, inline, user, hasLoaded, loadMessages]);

  // Poll for new messages every 10 seconds while chat is open
  useEffect(() => {
    if ((!isOpen && !inline) || !user) return;
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [isOpen, inline, user, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || isSending) return;

    const messageText = inputText.trim();
    setIsSending(true);

    // Optimistic add
    const tempMsg: ChatMsg = {
      id: `temp-${Date.now()}`,
      content: messageText,
      isAdmin: false,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with real one
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m));
      } else {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!inline && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="fixed bottom-6 end-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 z-50"
            aria-label="Open support chat"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {(inline || isOpen) && (
          <motion.div
            initial={inline ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.95 }}
            animate={inline ? { opacity: 1 } : { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={inline ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={inline 
              ? "w-full max-w-lg mx-auto bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 h-[500px]"
              : "fixed bottom-6 end-6 w-[350px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col border border-gray-100 sm:bottom-6 sm:end-6 bottom-0 end-0 sm:w-[350px] w-full sm:rounded-2xl rounded-t-2xl rounded-b-none"
            }
            style={{ maxHeight: (inline || !isMinimized) ? '85vh' : 'auto' }}
          >
            {/* Header */}
            <div className={`bg-[#0f172a] text-white p-4 flex items-center justify-between ${inline ? '' : 'cursor-pointer shadow-sm'}`} onClick={() => !inline && setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm">Okinte Support</h3>
                  <p className="text-[10px] text-white/70">Typically replies in a few minutes</p>
                </div>
              </div>
              {!inline && (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Chat Body & Input */}
            <AnimatePresence>
              {(inline || !isMinimized) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'calc(100% - 64px)', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col flex-1"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.length === 0 && hasLoaded && (
                      <div className="text-center text-sm text-gray-400 py-8">
                        Send a message to start a conversation with our support team.
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm flex flex-col ${
                          msg.isAdmin 
                            ? 'bg-gray-100 text-gray-800 rounded-tl-sm' 
                            : 'bg-[#2563EB] text-white rounded-tr-sm'
                        }`}>
                          <span>{msg.content}</span>
                          <span className={`text-[10px] mt-1 text-end ${msg.isAdmin ? 'text-gray-400' : 'text-white/60'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSend} className="p-3 border-t bg-white flex items-end gap-2">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 max-h-32 min-h-[44px] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] resize-none"
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending || !user}
                      className="bg-[#2563EB] text-white p-2.5 rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex justify-center items-center"
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin -ml-0.5" />
                      ) : (
                        <Send className="w-5 h-5 -ml-0.5" />
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
