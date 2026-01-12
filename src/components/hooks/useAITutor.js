import { useCallback, useState } from 'react';
import { useSession } from '@/components/hooks/useSession';
import { requestAiTutorResponse } from '@/components/ai/aiClient';

/**
 * useAITutor Hook
 * Manages the state and interactions for the AI Tutor chat interface.
 */
export function useAITutor(context = {}) {
  const { user, activeSchoolId } = useSession();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Shalom! I am your AI study partner. How can I help you deepen your understanding of this lesson today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content) => {
    // Optimistic user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      if (!activeSchoolId) {
        throw new Error('no_active_school');
      }

      const conversation = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await requestAiTutorResponse({
        prompt: content,
        school_id: activeSchoolId,
        context_type: context?.contextType || 'GENERAL',
        context_id: context?.contextId || null,
        context_title: context?.contextTitle || null,
        context_content: context?.contextContent || null,
        messages: conversation,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result?.response || 'No response available.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Tutor Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: error?.message === 'no_active_school'
          ? 'Select a school to use the AI tutor.'
          : 'Sorry, I encountered an error. Please try again.',
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [activeSchoolId, context, messages]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Shalom! Chat history cleared. What would you like to discuss?',
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat
  };
}
