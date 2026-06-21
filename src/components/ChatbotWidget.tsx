import React from 'react';
import { MessageSquare, Bot, X, Send } from 'lucide-react';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

interface ChatbotWidgetProps {
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;
  chatMessages: Message[];
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: () => void;
  chatMessagesEndRef: React.RefObject<HTMLDivElement | null>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  formatMarkdownToHtml: (str: string) => string;
}

export default function ChatbotWidget({
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
  chatMessagesEndRef,
  chatContainerRef,
  formatMarkdownToHtml
}: ChatbotWidgetProps) {
  return (
    <div className="ai-widget-container" id="ai-chat-widget">
      <button
        className="ai-chat-trigger"
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Open AI Eco-Assistant Chat"
      >
        {isChatOpen ? <X id="chat-icon-trigger" aria-hidden="true" /> : <MessageSquare id="chat-icon-trigger" aria-hidden="true" />}
        {!isChatOpen && <span className="pulse-ring" aria-hidden="true"></span>}
      </button>

      <div className={`ai-chat-box glass-panel ${isChatOpen ? 'active' : ''}`} id="chat-box-container" role="dialog" aria-label="AI Eco-Assistant Panel">
        <div className="chat-header">
          <div className="chat-header-info">
            <Bot className="chat-bot-icon text-emerald" aria-hidden="true" />
            <div>
              <h4>Eco-Assistant</h4>
              <span className="status-indicator">Online</span>
            </div>
          </div>
          <button className="close-chat-btn" onClick={() => setIsChatOpen(false)} aria-label="Close chatbot">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="chat-messages" id="chat-messages-container" aria-live="polite" ref={chatContainerRef as any}>
          {chatMessages.map((msg, index) => (
            <div key={index} className={`msg ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
              {msg.isTyping ? (
                <p className="animate-pulse">{msg.text}</p>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(msg.text) }} />
              )}
            </div>
          ))}
          <div ref={chatMessagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            id="chat-input-field"
            placeholder="Ask a green question..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            aria-label="Type your sustainability question"
          />
          <button className="send-msg-btn" onClick={handleSendMessage} aria-label="Send message">
            <Send aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
