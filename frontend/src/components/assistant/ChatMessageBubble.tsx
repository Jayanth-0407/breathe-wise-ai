'use client';

import React from 'react';
import { Bot, User, ExternalLink, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { FormattedMessage } from './FormattedMessage';

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  onActionClick?: (action: string) => void;
}

export function ChatMessageBubble({ msg, onActionClick }: ChatMessageBubbleProps) {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-forest-600 text-white'
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm shadow-xs ${
            isUser
              ? 'bg-forest-600 text-white rounded-tr-xs'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
          }`}
        >
          <FormattedMessage content={msg.content} isUser={isUser} />
        </div>

        {/* Citations */}
        {msg.citations && msg.citations.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Authoritative Source Grounding ({msg.citations.length})
            </span>
            <div className="space-y-1.5">
              {msg.citations.map((cite, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800 block">{cite.title}</span>
                    <span className="text-[11px] text-slate-500">{cite.source}</span>
                  </div>
                  {cite.url && (
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-600 hover:text-forest-700 shrink-0 mt-0.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Suggestions */}
        {msg.suggested_actions && msg.suggested_actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.suggested_actions.map((act, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => onActionClick && onActionClick(act)}
                className="text-[11px] h-7 px-2.5 rounded-full border-forest-200 text-forest-800 hover:bg-forest-50 gap-1 font-semibold"
              >
                {act} <ArrowRight className="w-3 h-3 text-forest-600" />
              </Button>
            ))}
          </div>
        )}

        <div className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.timestamp}
        </div>
      </div>
    </div>
  );
}
