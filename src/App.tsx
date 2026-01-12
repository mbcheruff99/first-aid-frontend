import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Heart, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const uniqueId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(uniqueId);

    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your first-aid assistant. How can I help you today?'
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: userMessage,
        conversation_id: conversationId
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
      <header className="bg-white border-b-4 border-red-500 shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-red-500 p-2 rounded-lg">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">First-Aid Assistant</h1>
            <p className="text-sm text-gray-600">Your personal medical guidance chatbot</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-red-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border-2 border-red-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border-2 border-red-100 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t-2 border-red-100 bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your medical situation..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
