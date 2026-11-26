import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown, RotateCcw, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FAQ_ITEMS, type FaqItem } from '../data/portfolioContext';
import { ChatMarkdown } from './ChatMarkdown';
import { RobotMascot } from './RobotMascot';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isFaq?: boolean;
}

interface ChatPosition {
  x: number;
  y: number;
}

const WELCOME_MESSAGE =
  "Hey! I'm PEARL AI, created by Sabari. 💎";

const VIEWPORT_MARGIN = 12;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getBoxDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 368, height: 530 };
  }
  const width = Math.min(368, Math.max(260, window.innerWidth - VIEWPORT_MARGIN * 2));
  const height = Math.min(540, Math.max(320, window.innerHeight - VIEWPORT_MARGIN * 2));
  return { width, height };
}

function clampPosition(
  x: number,
  y: number,
  boxWidth: number,
  boxHeight: number
): ChatPosition {
  if (typeof window === 'undefined') {
    return { x, y };
  }
  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - boxWidth - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - boxHeight - VIEWPORT_MARGIN);
  return {
    x: Math.min(Math.max(VIEWPORT_MARGIN, x), maxX),
    y: Math.min(Math.max(VIEWPORT_MARGIN, y), maxY),
  };
}

function getInitialPosition(boxWidth: number, boxHeight: number): ChatPosition {
  if (typeof window === 'undefined') {
    return { x: 24, y: 24 };
  }
  const defaultRightOffset = window.innerWidth >= 640 ? 24 : 16;
  const defaultBottomOffset = window.innerWidth >= 640 ? 88 : 76;
  return clampPosition(
    window.innerWidth - boxWidth - defaultRightOffset,
    window.innerHeight - boxHeight - defaultBottomOffset,
    boxWidth,
    boxHeight
  );
}

export function PortfolioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFaqSectionOpen, setIsFaqSectionOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFaqThinking, setIsFaqThinking] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    retryPayload: Array<{ role: 'user' | 'assistant'; content: string }>;
  } | null>(null);

  const [position, setPosition] = useState<ChatPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const chatboxRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastSubmitAtRef = useRef(0);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const faqAnimRef = useRef<{
    thinkingTimerId: number | null;
    typingRafId: number | null;
    assistantMsgId: string;
    fullAnswer: string;
    phase: 'thinking' | 'typing';
  } | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
  } | null>(null);

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    window.requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto',
      });
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    scrollToBottom();
  }, [isOpen, messages, isLoading, isFaqThinking, errorInfo, scrollToBottom]);

  // Ensure opened position exists and remains clamped inside viewport on resize
  useEffect(() => {
    if (!isOpen) return;

    const syncBounds = () => {
      const rect = chatboxRef.current?.getBoundingClientRect();
      const fallback = getBoxDimensions();
      const boxW = rect?.width && rect.width > 0 ? rect.width : fallback.width;
      const boxH = rect?.height && rect.height > 0 ? rect.height : fallback.height;

      setPosition((prev) => {
        if (!prev) {
          return getInitialPosition(boxW, boxH);
        }
        return clampPosition(prev.x, prev.y, boxW, boxH);
      });
    };

    syncBounds();
    window.addEventListener('resize', syncBounds);
    window.addEventListener('orientationchange', syncBounds);
    return () => {
      window.removeEventListener('resize', syncBounds);
      window.removeEventListener('orientationchange', syncBounds);
    };
  }, [isOpen]);

  // Abort any pending AI request and FAQ timers on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      const active = faqAnimRef.current;
      if (active) {
        if (active.thinkingTimerId !== null) {
          window.clearTimeout(active.thinkingTimerId);
        }
        if (active.typingRafId !== null) {
          window.cancelAnimationFrame(active.typingRafId);
        }
        faqAnimRef.current = null;
      }
    };
  }, []);

  const handleOpenToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && !position) {
        const { width, height } = getBoxDimensions();
        setPosition(getInitialPosition(width, height));
      }
      return next;
    });
  }, [position]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsDragging(false);
    dragStateRef.current = null;
  }, []);

  // Auto-close chatbox when clicking/tapping anywhere outside it
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (dragStateRef.current) return;

      const target = e.target;
      if (!(target instanceof Node)) return;
      if (chatboxRef.current?.contains(target)) return;
      if (launcherRef.current?.contains(target)) return;

      handleClose();
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
    };
  }, [isOpen, handleClose]);

  const finalizeFaqAnimation = useCallback((commitFullAnswer: boolean) => {
    const active = faqAnimRef.current;
    if (!active) return;

    if (active.thinkingTimerId !== null) {
      window.clearTimeout(active.thinkingTimerId);
    }
    if (active.typingRafId !== null) {
      window.cancelAnimationFrame(active.typingRafId);
    }
    faqAnimRef.current = null;
    setIsFaqThinking(false);

    if (!commitFullAnswer) return;

    if (active.phase === 'thinking') {
      setMessages((prev) => [
        ...prev,
        {
          id: active.assistantMsgId,
          role: 'assistant',
          content: active.fullAnswer,
          isFaq: true,
        },
      ]);
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === active.assistantMsgId ? { ...m, content: active.fullAnswer } : m
        )
      );
    }
  }, []);

  const handleClearChat = useCallback(() => {
    finalizeFaqAnimation(false);
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    inFlightRef.current = false;
    setIsLoading(false);
    setErrorInfo(null);
    setMessages([]);
    setInputValue('');
    setIsFaqSectionOpen(true);
  }, [finalizeFaqAnimation]);

  const handleToggleFaqSection = useCallback(() => {
    setIsFaqSectionOpen((prev) => {
      const next = !prev;
      if (next) {
        window.requestAnimationFrame(() => {
          scrollContainerRef.current?.scrollTo({
            top: 0,
            behavior: 'auto',
          });
        });
      }
      return next;
    });
  }, []);

  const sendToGroq = useCallback(
    async (payloadMessages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setIsLoading(true);
      setErrorInfo(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      let timedOut = false;
      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 28000);

      const apiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
      const chatEndpoint = `${apiBase}/api/chat`;

      try {
        const response = await fetch(chatEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadMessages,
            website: honeypotValue,
          }),
          signal: controller.signal,
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setErrorInfo({
            message:
              'The AI chat service (/api/chat) returned an unexpected response. Please verify the API route is deployed and retry.',
            retryPayload: payloadMessages,
          });
          return;
        }

        let data: { reply?: string; error?: string } = {};
        try {
          data = (await response.json()) as { reply?: string; error?: string };
        } catch {
          setErrorInfo({
            message: 'Failed to parse response from /api/chat. Please retry.',
            retryPayload: payloadMessages,
          });
          return;
        }

        if (!response.ok) {
          const errMessage =
            data.error ||
            `Request failed (${response.status}). Please try again.`;
          setErrorInfo({
            message: errMessage,
            retryPayload: payloadMessages,
          });
          return;
        }

        const replyText = data.reply?.trim();
        if (!replyText) {
          setErrorInfo({
            message: 'Received an empty reply from the assistant. Please retry.',
            retryPayload: payloadMessages,
          });
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'assistant',
            content: replyText,
          },
        ]);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') {
          if (timedOut) {
            setErrorInfo({
              message: 'The assistant request timed out. Please retry.',
              retryPayload: payloadMessages,
            });
          }
          return;
        }
        setErrorInfo({
          message:
            'Network error while contacting the assistant. Please check your connection and retry.',
          retryPayload: payloadMessages,
        });
      } finally {
        window.clearTimeout(timeoutId);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        inFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [honeypotValue]
  );

  const handleFaqClick = useCallback(
    (faq: FaqItem) => {
      if (inFlightRef.current) return;

      // Prevent overlapping animations if another FAQ is clicked mid-animation
      finalizeFaqAnimation(true);
      setErrorInfo(null);

      const userMsgId = createId();
      const assistantMsgId = createId();
      const fullAnswer = faq.answer;

      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: 'user',
          content: faq.question,
          isFaq: true,
        },
      ]);
      setIsFaqThinking(true);

      const animState: NonNullable<typeof faqAnimRef.current> = {
        thinkingTimerId: null,
        typingRafId: null,
        assistantMsgId,
        fullAnswer,
        phase: 'thinking',
      };
      faqAnimRef.current = animState;

      animState.thinkingTimerId = window.setTimeout(() => {
        if (faqAnimRef.current !== animState) return;

        animState.thinkingTimerId = null;
        animState.phase = 'typing';
        setIsFaqThinking(false);

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: fullAnswer.slice(0, 1),
            isFaq: true,
          },
        ]);

        const startTime = performance.now();
        const totalDurationMs = Math.min(1400, Math.max(650, fullAnswer.length * 2));
        let lastShownLength = 1;

        const step = (now: number) => {
          if (faqAnimRef.current !== animState) return;

          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / totalDurationMs);
          const nextLength =
            progress >= 1
              ? fullAnswer.length
              : Math.max(lastShownLength, Math.floor(progress * fullAnswer.length));

          if (nextLength > lastShownLength) {
            lastShownLength = nextLength;
            const partial = fullAnswer.slice(0, nextLength);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsgId ? { ...m, content: partial } : m))
            );
          }

          if (nextLength >= fullAnswer.length) {
            animState.typingRafId = null;
            faqAnimRef.current = null;
            return;
          }

          animState.typingRafId = window.requestAnimationFrame(step);
        };

        if (fullAnswer.length <= 1) {
          faqAnimRef.current = null;
          return;
        }
        animState.typingRafId = window.requestAnimationFrame(step);
      }, 450);
    },
    [finalizeFaqAnimation]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (inFlightRef.current || isLoading) return;

      const trimmed = inputValue.trim();
      if (!trimmed) {
        setValidationError('Please enter a message before sending.');
        inputRef.current?.focus();
        return;
      }

      if (trimmed.length > 2000) {
        setValidationError('Messages cannot exceed 2000 characters.');
        inputRef.current?.focus();
        return;
      }

      const now = Date.now();
      if (now - lastSubmitAtRef.current < 900) {
        setValidationError('Please wait a moment before sending another message.');
        return;
      }
      lastSubmitAtRef.current = now;
      setValidationError(null);

      const pendingFaq = faqAnimRef.current;
      let baseHistory = messages;
      if (pendingFaq) {
        if (pendingFaq.phase === 'thinking') {
          baseHistory = [
            ...messages,
            {
              id: pendingFaq.assistantMsgId,
              role: 'assistant',
              content: pendingFaq.fullAnswer,
              isFaq: true,
            },
          ];
        } else {
          baseHistory = messages.map((m) =>
            m.id === pendingFaq.assistantMsgId
              ? { ...m, content: pendingFaq.fullAnswer }
              : m
          );
        }
        finalizeFaqAnimation(false);
      }

      const userMsg: ChatMessage = {
        id: createId(),
        role: 'user',
        content: trimmed,
      };

      const nextHistory = [...baseHistory, userMsg];
      setMessages(nextHistory);
      setInputValue('');

      const payload = nextHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      void sendToGroq(payload);
    },
    [finalizeFaqAnimation, inputValue, isLoading, messages, sendToGroq]
  );

  const handleRetry = useCallback(() => {
    if (inFlightRef.current || isLoading || !errorInfo) return;
    void sendToGroq(errorInfo.retryPayload);
  }, [errorInfo, isLoading, sendToGroq]);

  // Header dragging (mouse & touch via Pointer Events)
  const handleHeaderPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button')) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      const boxEl = chatboxRef.current;
      if (!boxEl) return;

      const rect = boxEl.getBoundingClientRect();
      const currentPos = position ?? { x: rect.left, y: rect.top };

      dragStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: currentPos.x,
        originY: currentPos.y,
        width: rect.width,
        height: rect.height,
      };

      setIsDragging(true);
      e.preventDefault();
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      setPosition(
        clampPosition(drag.originX + dx, drag.originY + dy, drag.width, drag.height)
      );
    };

    const handlePointerEnd = (e: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      dragStateRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isDragging]);

  const dims = getBoxDimensions();
  const resolvedPos = position ?? getInitialPosition(dims.width, dims.height);

  return (
    <>
      {/* Smooth Background Blur & Subtle Dark Glassmorphism Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbox-backdrop-overlay"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-0 z-[35] bg-[#031010]/45 backdrop-blur-md ${
              isOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Fixed Non-Draggable Chatbox Starter Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={handleOpenToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Ask Sabari's Assistant" : "Open Ask Sabari's Assistant"}
        title="Ask Sabari's Assistant"
        className="touch-press fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] rounded-full transition-transform duration-200 hover:scale-[1.02] sm:bottom-6 sm:right-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <span className="glass-surface glass-interactive inline-flex max-w-full items-center gap-2.5 rounded-full border border-teal-300/30 bg-[#071E1E]/92 py-1.5 pl-2 pr-4 text-left shadow-[0_14px_34px_-8px_rgba(0,0,0,0.85),0_0_24px_-6px_rgba(56,189,248,0.32)] backdrop-blur-xl hover:border-teal-300/60 sm:gap-3 sm:pr-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/50 bg-[#030914] shadow-[0_0_14px_-2px_rgba(56,189,248,0.55)] sm:h-11 sm:w-11">
            <RobotMascot className="h-full w-full scale-105" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold leading-tight text-[#FFFF00] sm:text-base">
              Ask Sabari&apos;s Assistant
            </span>
            <span className="block truncate text-[11.5px] italic leading-tight text-[#A0B2B2] sm:text-xs">
              FAQ &amp; AI Chat
            </span>
          </span>
        </span>
      </button>

      {/* Opened Draggable Dark Teal Glassmorphism Chatbox */}
      {isOpen && (
        <div
          ref={chatboxRef}
          role="complementary"
          aria-label="Ask Sabari's Assistant"
          style={{
            left: `${resolvedPos.x}px`,
            top: `${resolvedPos.y}px`,
            width: `min(368px, calc(100vw - ${VIEWPORT_MARGIN * 2}px))`,
            height: `min(540px, calc(100dvh - ${VIEWPORT_MARGIN * 2}px))`,
          }}
          className="fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-teal-300/25 bg-[#061D1D]/90 text-white shadow-[0_24px_60px_-14px_rgba(0,0,0,0.9),0_0_32px_-12px_rgba(45,212,191,0.32),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
        >
          {/* Draggable Header */}
          <div
            onPointerDown={handleHeaderPointerDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            className="flex shrink-0 touch-none select-none items-center justify-between gap-2.5 border-b border-teal-200/15 bg-gradient-to-r from-[#0A2C2C]/95 via-[#072121]/95 to-[#0A2828]/95 px-3.5 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/50 bg-[#030914] shadow-[0_0_12px_-2px_rgba(56,189,248,0.45)]">
                <RobotMascot className="h-full w-full scale-105" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-sans text-sm font-bold tracking-normal text-white leading-tight">
                  Ask Sabari&apos;s Assistant
                </h2>
                <p className="truncate text-[11px] text-teal-200/90 leading-tight">
                  Drag header to move
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                aria-label="Clear chat"
                title="Clear chat"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-teal-200/80 transition-colors hover:border-teal-300/25 hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close chat"
                title="Close chat"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-teal-200/80 transition-colors hover:border-teal-300/25 hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Top FAQ Section Bar with Rotating Chevron Toggle */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-teal-200/15 bg-[#041818]/90 px-3.5 py-2">
            <p className="text-[11.5px] font-bold tracking-wide text-teal-200/95">
              Frequently Asked Questions
            </p>
            <button
              type="button"
              onClick={handleToggleFaqSection}
              aria-expanded={isFaqSectionOpen}
              aria-label={isFaqSectionOpen ? 'Collapse FAQ section' : 'Expand FAQ section'}
              title={isFaqSectionOpen ? 'Collapse FAQ section' : 'Expand FAQ section'}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-teal-200/85 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ease-out ${
                  isFaqSectionOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
          </div>

          {/* Scrollable FAQ (Collapsible) + Separate Welcome Message + Chat Messages */}
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            aria-label="Chat messages and FAQ"
            className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3.5 py-3 text-[13px] focus:outline-none"
          >
            {/* Frequently Asked Questions (5 Vertical Buttons) */}
            <AnimatePresence initial={false}>
              {isFaqSectionOpen && (
                <motion.div
                  key="faq-questions-list"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-teal-300/15 bg-[#041616]/60 p-2.5">
                    <div className="flex flex-col gap-1.5">
                      {FAQ_ITEMS.map((faq) => (
                        <button
                          key={faq.id}
                          type="button"
                          onClick={() => handleFaqClick(faq)}
                          className="w-full rounded-lg border border-teal-300/20 bg-[#092727]/80 px-2.5 py-1.5 text-left text-[12.5px] text-teal-50 transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          {faq.question}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Welcome Message Bubble (Below and Separate from FAQ Section) */}
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/45 bg-[#030914]">
                <RobotMascot className="h-full w-full scale-105" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-teal-300/20 bg-[#0A2929]/85 px-3 py-2 text-[#E8F6F6] shadow-sm">
                <p className="leading-relaxed">{WELCOME_MESSAGE}</p>
              </div>
            </div>

            {/* Conversation History Bubbles */}
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[84%] rounded-2xl rounded-tr-sm border border-emerald-400/35 bg-emerald-500/20 px-3 py-2 text-white shadow-sm">
                    <p className="leading-relaxed break-words">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/45 bg-[#030914]">
                    <RobotMascot className="h-full w-full scale-105" />
                  </div>
                  <div className="min-w-0 max-w-[85%] rounded-2xl rounded-tl-sm border border-teal-300/20 bg-[#0A2929]/90 px-3 py-2 text-[#E8F6F6] shadow-sm">
                    <ChatMarkdown content={msg.content} />
                  </div>
                </div>
              )
            )}

            {/* Loading Indicator (AI & FAQ Thinking...) */}
            {(isLoading || isFaqThinking) && (
              <div
                aria-live="polite"
                className="flex items-start gap-2"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/45 bg-[#030914]">
                  <RobotMascot className="h-full w-full scale-105" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm border border-teal-300/20 bg-[#0A2929]/90 px-3.5 py-2.5 text-teal-100">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.25s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-300 [animation-delay:-0.12s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300" />
                  </span>
                  <span className="text-xs text-teal-200/90">Thinking...</span>
                </div>
              </div>
            )}

            {/* Error Notice + Retry */}
            {errorInfo && !isLoading && (
              <div
                role="alert"
                className="rounded-xl border border-rose-400/35 bg-rose-950/50 px-3 py-2.5 text-xs text-rose-100"
              >
                <p className="leading-relaxed">{errorInfo.message}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/35 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          {/* Input Bar + Green Send Button */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex shrink-0 flex-col border-t border-teal-200/15 bg-[#051818]/90 px-3 py-2.5"
          >
            {/* Offscreen Honeypot for Automated Bot Detection */}
            <input
              type="text"
              name="website"
              value={honeypotValue}
              onChange={(e) => setHoneypotValue(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ask me anything..."
                aria-label="Ask me anything"
                aria-invalid={validationError ? true : undefined}
                aria-describedby={validationError ? 'chat-validation-error' : undefined}
                maxLength={2001}
                className="h-9 min-w-0 flex-1 rounded-xl border border-teal-300/25 bg-[#0A2626]/90 px-3 text-[13px] text-white placeholder:text-[#9FC7C7] focus:border-emerald-400/65 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
              />
              <button
                type="submit"
                disabled={isLoading}
                aria-label="Send message"
                title="Send"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[#031510] shadow-[0_0_16px_-3px_rgba(16,185,129,0.7)] transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/40 disabled:text-white/60 disabled:shadow-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {validationError && (
              <p
                id="chat-validation-error"
                role="alert"
                className="mt-1.5 text-[11.5px] font-medium text-rose-300"
              >
                {validationError}
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
}
