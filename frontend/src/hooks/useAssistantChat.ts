'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/types';
import { getStoredActiveLocation } from '@/lib/profile';
import { INITIAL_MESSAGES } from '@/types/assistant';

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLocation, setActiveLocation] = useState<{
    name: string;
    city: string;
    lat: number;
    lon: number;
  }>({
    name: 'Chennai',
    city: 'Chennai',
    lat: 13.0827,
    lon: 80.2707,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setActiveLocation(getStoredActiveLocation());
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await fetch(`${apiBase}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          latitude: activeLocation.lat,
          longitude: activeLocation.lon,
          location_name: activeLocation.name,
          city_name: activeLocation.city,
          conversation_history: history,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations || [],
          suggested_actions: data.suggested_actions || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Backend chat error');
      }
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: "I am having trouble connecting to the intelligence server right now. In the meantime, please check your Live Dashboard for current AQI readings.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    loading,
    activeLocation,
    messagesEndRef,
    handleSendMessage,
  };
}
