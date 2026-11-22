'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  BookOpen, 
  Info, 
  AlertCircle,
  Wrench,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChatMessage } from '@/lib/types';
import { getStoredActiveLocation } from '@/lib/profile';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    sender: 'assistant',
    content: (
      "Hello! I am **BreatheWise AI**, your pollution-aware fitness and mobility assistant. "
      + "I can evaluate real-time air quality, recommend optimal workout windows, estimate your inhaled PM2.5 dose, "
      + "and answer respiratory protection questions grounded in authoritative WHO and CPCB environmental guidelines.\n\n"
      + "How can I help you plan your day today?"
    ),
    timestamp: 'Just now',
    citations: [
      {
        title: 'WHO Global Air Quality Guidelines (2021)',
        source: 'World Health Organization (WHO), 2021',
        url: 'https://www.who.int/publications/i/item/9789240034228',
      },
    ],
  },
];

const STARTER_PROMPTS = [
  "Is an N95 mask effective for outdoor jogging?",
  "What is the best time for outdoor exercise today?",
  "How is my inhaled PM2.5 exposure dose calculated?",
  "How do I choose the right room air purifier (CADR)?",
];

function renderInline(text: string, isUser: boolean): React.ReactNode {
  // Parses **bold** and *italic* tokens, removing raw asterisks
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Headers: ###, ##, #
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className={`font-bold text-xs sm:text-sm pt-1 ${isUser ? 'text-white' : 'text-slate-900'}`}>
              {renderInline(trimmed.replace(/^###\s+/, ''), isUser)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className={`font-extrabold text-sm sm:text-base pt-1.5 ${isUser ? 'text-white' : 'text-slate-900'}`}>
              {renderInline(trimmed.replace(/^##\s+/, ''), isUser)}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className={`font-black text-base sm:text-lg pt-2 ${isUser ? 'text-white' : 'text-slate-900'}`}>
              {renderInline(trimmed.replace(/^#\s+/, ''), isUser)}
            </h2>
          );
        }

        // Bullets: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className={`font-bold text-xs ${isUser ? 'text-emerald-300' : 'text-forest-600'}`}>•</span>
              <span className="flex-1">{renderInline(trimmed.slice(2), isUser)}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInline(line, isUser)}</p>;
      })}
    </div>
  );
}

export default function AssistantPage() {
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

  // Load user's active geographic context from Single Source of Truth
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            LangGraph & Groq Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Environmental Health Assistant
          </h1>
          <p className="text-sm text-slate-600">
            Ask questions about air pollution, mask protection, workout timing, and exercise dose grounded in WHO, CPCB, and EPA science.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-forest-600" />
          RAG Verified Grounding
        </div>
      </div>

      {/* Location Context Banner & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Inquiring Location
            </span>
            <span className="text-xs font-bold text-slate-900">
              {activeLocation.name} ({activeLocation.lat.toFixed(2)}°N, {activeLocation.lon.toFixed(2)}°E)
            </span>
          </div>
        </div>

        {/* Quick City Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden md:inline">Context:</span>
          {[
            { name: 'Chennai', city: 'Chennai', lat: 13.0827, lon: 80.2707 },
            { name: 'Delhi NCR', city: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
            { name: 'Mumbai', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
            { name: 'Bengaluru', city: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
          ].map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setActiveLocation(c)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                activeLocation.city.toLowerCase() === c.city.toLowerCase()
                  ? 'bg-forest-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {[
          `What is the current air quality in ${activeLocation.name}?`,
          `What is the best time for outdoor exercise in ${activeLocation.name} today?`,
          "Is an N95 mask effective for outdoor jogging?",
          "How is my inhaled PM2.5 exposure dose calculated?",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-forest-400 hover:bg-forest-50/50 transition text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <Card className="flex-1 flex flex-col overflow-hidden min-h-[480px] shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                    isUser
                      ? 'bg-slate-800'
                      : 'bg-forest-600 shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>

                {/* Bubble */}
                <div className={`space-y-3 ${isUser ? 'items-end' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <FormattedMessage content={msg.content} isUser={isUser} />
                    <span
                      className={`text-[10px] block mt-2 ${
                        isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Citations Panel (Assistant only) */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 text-forest-600" /> Grounded Source Citations
                      </div>
                      <div className="space-y-1.5">
                        {msg.citations.map((c, idx) => (
                          <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5">
                            <span className="font-semibold text-slate-900 block">{c.title}</span>
                            <span className="text-[11px] text-slate-500 block">{c.source}</span>
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-forest-700 hover:text-forest-800 font-semibold"
                              >
                                View Documentation <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-9 h-9 rounded-xl bg-forest-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-forest-600 animate-bounce"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]"></span>
                <span>Consulting deterministic tools & WHO/CPCB guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about air pollution, workout timing, N95 masks, or exposure calculations..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-forest-600 focus:ring-forest-600 focus:outline-none"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="px-4 py-2.5 gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            BreatheWise AI is an environmental guidance tool, not a medical practitioner. Never disregard clinical medical advice.
          </p>
        </div>
      </Card>
    </div>
  );
}
