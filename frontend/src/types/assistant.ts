/**
 * BreatheWise AI - Conversational Assistant Types & Defaults
 * ==========================================================
 */

import { ChatMessage } from '@/lib/types';

export const INITIAL_MESSAGES: ChatMessage[] = [
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

export const STARTER_PROMPTS: string[] = [
  "Is an N95 mask effective for outdoor jogging?",
  "What is the best time for outdoor exercise today?",
  "How is my inhaled PM2.5 exposure dose calculated?",
  "How do I choose the right room air purifier (CADR)?",
];
