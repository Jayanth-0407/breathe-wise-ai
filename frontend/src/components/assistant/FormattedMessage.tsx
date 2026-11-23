'use client';

import React from 'react';

function renderInline(text: string, isUser: boolean): React.ReactNode {
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

interface FormattedMessageProps {
  content: string;
  isUser: boolean;
}

export function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

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
