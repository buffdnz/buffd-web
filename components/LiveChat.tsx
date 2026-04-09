'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FAQ_PROMPTS, FAQ_ANSWERS } from '../data/faq';

type Message = {
  id: string;
  type: 'bot' | 'user';
  text: string;
};

type FaqId = keyof typeof FAQ_ANSWERS;

type LiveChatProps = {
  estimate?: string | null;
  onBookNow?: () => void;
};

const LiveChat: React.FC<LiveChatProps> = ({ estimate = null, onBookNow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: 'Hi — what would you like to know?',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const promptMap = useMemo(() => {
    return new Map(FAQ_PROMPTS.map((prompt) => [prompt.id, prompt.label]));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
    
  const resolveAnswer = (id: FaqId): string => {
    const entry = FAQ_ANSWERS[id];

    if (typeof entry === 'function') {
      return entry(estimate);
    }

    return entry;
  };

  const handlePromptClick = (id: FaqId) => {
    if (id === 'booking' && onBookNow) {
      onBookNow();
    }

    if (id === 'difference') {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }

    const userLabel = promptMap.get(id) ?? 'Question';
    const botAnswer = resolveAnswer(id);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${id}-${Date.now()}`,
        type: 'user',
        text: userLabel,
      },
      {
        id: `bot-${id}-${Date.now() + 1}`,
        type: 'bot',
        text: botAnswer,
      },
    ]);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        type: 'bot',
        text: 'Hi — what would you like to know?',
      },
    ]);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] sm:bg-black/20" />
      )}

      <div className="fixed bottom-4 right-4 z-50 sm:bottom-20">
        {isOpen ? (
          <div
            ref={panelRef}
            className="theme-card w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-3xl shadow-2xl max-sm:max-h-[75vh] sm:w-[380px]"
          >
            <div className="theme-surface flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Live Chat</p>
                <p className="text-xs text-[var(--text-muted)]">Instant answers</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-muted)] transition hover:bg-white/10"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-white/10"
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.type === 'bot'
                      ? 'theme-surface text-[var(--text)]'
                      : 'ml-auto theme-accent text-white'
                  }`}
                >
                  {message.text}
                </div>
              ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[var(--border)] px-4 py-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Quick questions
              </p>

              <div className="max-h-24 overflow-y-auto pr-1 sm:max-h-28">
                <div className="flex flex-wrap gap-2">
                  {FAQ_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => handlePromptClick(prompt.id as FaqId)}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-left text-[11px] text-[var(--text)] transition hover:bg-white/10"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onBookNow}
                  className="theme-accent w-full rounded-2xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-[var(--text)] px-5 py-4 rounded-full shadow-lg hover:bg-white/20 transition"
          >
            Chat
          </button>
        )}
      </div>
    </>
  );
};

export default LiveChat;