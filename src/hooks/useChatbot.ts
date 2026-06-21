import { useState } from 'react';
import { askChatbot } from '@/services/api';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

export function useChatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi! I'm your CarbonFlow Eco-Assistant. Ask me any questions about saving energy, diet swaps, transport efficiency, or carbon tracking!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msgText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: msgText }]);
    setChatMessages(prev => [...prev, { sender: 'bot', text: 'Thinking...', isTyping: true }]);
    try {
      const res = await askChatbot(msgText);
      setChatMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { sender: 'bot', text: res.reply }
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }
      ]);
    }
  };

  return {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    chatInput,
    setChatInput,
    handleSendMessage
  };
}
