'use client';

import React from 'react';
import { Send, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { ChatMessageBubble } from '@/components/assistant/ChatMessageBubble';
import { STARTER_PROMPTS } from '@/types/assistant';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function AssistantPage() {
  const {
    messages,
    inputValue,
    setInputValue,
    loading,
    activeLocation,
    messagesEndRef,
    handleSendMessage,
  } = useAssistantChat();

  return (
    <ErrorBoundary fallbackTitle="Assistant Unavailable" fallbackMessage="Could not connect to the environmental AI assistant.">
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
              Get scientifically grounded guidance on masks, air purifiers, and exercise windows.
            </p>
          </div>

          <Badge variant="outline" className="text-xs py-1 px-3 gap-1.5 font-medium border-slate-300 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            Context: {activeLocation.name}
          </Badge>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-200/80 p-4 sm:p-6 overflow-y-auto min-h-[420px] max-h-[580px] space-y-4">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} msg={msg} onActionClick={handleSendMessage} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-600" />
              Analyzing atmospheric monitors and formulating grounded guidance...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts */}
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-forest-400 hover:text-forest-800 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-xs focus-within:ring-2 focus-within:ring-forest-500"
        >
          <input
            type="text"
            placeholder="Ask about air quality, workout timing, or particulate defense..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-xs sm:text-sm border-none focus:outline-hidden"
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !inputValue.trim()}
            className="bg-forest-600 hover:bg-forest-700 text-white gap-1.5 text-xs font-bold px-4 py-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </Button>
        </form>
      </div>
    </ErrorBoundary>
  );
}
