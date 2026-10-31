'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const SUGGESTED_CHIPS = [
  'Which customer should I follow up with first?',
  'Who are my riskiest buyers and why?',
  'How much money is overdue in total?',
  "Why is Metro Suppliers' score what it is?",
  'Draft a polite reminder for Global Distributors',
];

function AssistantChatContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSentRef = useRef<boolean>(false);

  // Auto-scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle deep-link ?q=
  useEffect(() => {
    if (queryParam && !hasAutoSentRef.current && messages.length === 0) {
      hasAutoSentRef.current = true;
      sendMessage(queryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = () => {
    if (isStreaming) return;
    // Find the last user question in history
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove trailing error messages
      setMessages((prev) => {
        const lastUserIdx = prev.map((m) => m.id).lastIndexOf(lastUserMessage.id);
        return prev.slice(0, lastUserIdx);
      });
      sendMessage(lastUserMessage.content);
    }
  };

  const sendMessage = async (contentToSend: string) => {
    const trimmed = contentToSend.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsStreaming(true);

    const assistantMsgId = `asst_${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, initialAssistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        let errMessage = 'Unable to fetch response from PayFlow AI.';
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          // fallback
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: errMessage, isError: true }
              : msg
          )
        );
        setIsStreaming(false);
        return;
      }

      if (!response.body) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: 'No response received from assistant.', isError: true }
              : msg
          )
        );
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
          )
        );
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  'Network connection error connecting to PayFlow AI. Please check your network and retry.',
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleResetChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-t-xl px-6 py-4 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">PayFlow AI Assistant</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini 3.5 Flash Live
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Directly answers receivables, overdue risks & recovery actions from your verified ledger data (as of 31-Oct-2026).
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleResetChat}
            disabled={isStreaming}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Conversation</span>
          </button>
        )}
      </div>

      {/* Suggested Chips Bar */}
      <div className="bg-slate-50 border-x border-slate-200/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-600" /> Suggested:
        </span>
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isStreaming}
            onClick={() => sendMessage(chip)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 transition-all shadow-2xs disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 bg-white border-x border-slate-200/80 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-4 shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              How can I assist your cash-flow recovery today?
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Ask any question about your buyer portfolio, overdue aging, settlement behavior, or draft follow-up notices. All answers are strictly derived from your ledger data.
            </p>

            <div className="grid grid-cols-1 gap-2.5 w-full text-left">
              {SUGGESTED_CHIPS.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-xs font-medium text-slate-800 group shadow-2xs"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-700 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-rose-50/70 border border-rose-200 text-slate-900 rounded-bl-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-200/60">
                      <span className="text-[11px] font-semibold text-indigo-900 flex items-center gap-1">
                        PayFlow AI
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        {msg.content && !msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy response"
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : msg.isError ? (
                    <div className="flex flex-col gap-2.5 my-1">
                      <div className="flex items-start gap-2 text-rose-700 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-0.5">Unable to get AI response</p>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Question</span>
                      </button>
                    </div>
                  ) : msg.content ? (
                    <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-slate-900">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-1 text-xs text-slate-500 font-medium">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
                      Analyzing ledger & behavioral risk factors...
                    </div>
                  )}

                  {isUser && (
                    <div className="text-[10px] text-indigo-200 mt-1 text-right">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Disclaimer Footer */}
      <div className="bg-white border border-slate-200/80 rounded-b-xl p-4 shadow-sm shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="relative flex items-center gap-2"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? 'PayFlow AI is responding...'
                : 'Ask a question about overdue invoices, risk ranking, or draft reminders...'
            }
            disabled={isStreaming}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all disabled:opacity-60 pr-12 max-h-32 min-h-[48px]"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 top-2 p-2 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-40 disabled:hover:bg-indigo-700 transition-colors shadow-xs"
            title="Send query (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Invariant Disclaimer Line */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            AI answers are based on your ledger data as of 31-Oct-2026. Buyer Reliability Scores are behavioral assessments, not credit ratings.
          </span>
          <span className="text-[10px] text-slate-400">Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
            Loading PayFlow AI Assistant...
          </div>
        </div>
      }
    >
      <AssistantChatContent />
    </Suspense>
  );
}
