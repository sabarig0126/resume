import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FAQ_ITEMS, type FaqItem } from '../data/portfolioContext';
import { ChatMarkdown } from './ChatMarkdown';
import { RobotMascot } from './RobotMascot';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isFaq?: boolean;
  faqId?: string;
}

interface ActiveChatAnimState {
  thinkingTimerId: number | null;
  typingRafId: number | null;
  assistantMsgId: string;
  fullAnswer: string;
  isFaq: boolean;
  faqId?: string;
  phase: 'thinking' | 'typing';
}

interface ChatPosition {
  x: number;
  y: number;
}

const WELCOME_MESSAGE =
  "Hey! I'm PEARL AI, created by Sabari. Ask me about Sabari's skills, 36 certifications, education, or even today's date & current time.";

const VIEWPORT_MARGIN = 12;
const THINKING_DELAY_MS = 560;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getBoxDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 404, height: 580 };
  }
  const width = Math.min(404, Math.max(280, window.innerWidth - VIEWPORT_MARGIN * 2));
  const height = Math.min(590, Math.max(360, window.innerHeight - VIEWPORT_MARGIN * 2));
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
  const defaultRightOffset = window.innerWidth >= 640 ? 24 : 12;
  const defaultBottomOffset = window.innerWidth >= 640 ? 88 : 76;
  return clampPosition(
    window.innerWidth - boxWidth - defaultRightOffset,
    window.innerHeight - boxHeight - defaultBottomOffset,
    boxWidth,
    boxHeight
  );
}

const ChatLauncher = memo(function ChatLauncher({
  launcherRef,
  isOpen,
  onToggle,
}: {
  launcherRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      ref={launcherRef}
      type="button"
      onClick={onToggle}
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
  );
});

const FaqSection = memo(function FaqSection({
  isFaqSectionOpen,
  isBusy,
  onFaqClick,
}: {
  isFaqSectionOpen: boolean;
  isBusy: boolean;
  onFaqClick: (faq: FaqItem) => void;
}) {
  return (
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
          <div className="rounded-xl border border-teal-300/15 bg-[#041717]/75 p-2.5 shadow-inner">
            <div className="flex flex-col gap-1.5">
              {FAQ_ITEMS.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onFaqClick(faq)}
                  className="group flex w-full items-center justify-between gap-2 rounded-lg border border-teal-300/20 bg-[#082424]/85 px-3 py-2 text-left text-[12.5px] font-medium text-teal-50 transition-all hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span className="min-w-0 leading-snug">{faq.question}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-teal-300/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const ChatMessageBubble = memo(function ChatMessageBubble({
  msg,
  isTypingThis,
  isLatestAssistant,
  isBusy,
  onRegenerate,
}: {
  msg: ChatMessage;
  isTypingThis: boolean;
  isLatestAssistant: boolean;
  isBusy: boolean;
  onRegenerate: (msgId: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(msg.content);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // Clipboard write unavailable in restricted browser context
    }
  };

  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-emerald-400/35 bg-gradient-to-br from-emerald-500/25 via-emerald-500/18 to-teal-500/20 px-3.5 py-2.5 text-[13px] text-white shadow-[0_6px_18px_-8px_rgba(0,0,0,0.55)]">
          <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-2.5"
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/45 bg-[#030914] shadow-[0_0_10px_-3px_rgba(56,189,248,0.45)]">
        <RobotMascot className="h-full w-full scale-105" />
      </div>
      <div className="min-w-0 max-w-[86%] flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-teal-300/20 bg-[#082424]/92 px-3.5 py-2.5 text-[#E8F6F6] shadow-[0_8px_22px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <ChatMarkdown content={msg.content} />
          {isTypingThis && (
            <span
              aria-hidden="true"
              className="mt-1 inline-block h-3.5 w-[2px] animate-pulse rounded-full bg-emerald-400 align-middle"
            />
          )}
        </div>

        {!isTypingThis && msg.content.trim().length > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 pl-1">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Response copied' : 'Copy response'}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-teal-200/75 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {isLatestAssistant && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onRegenerate(msg.id)}
                aria-label="Regenerate response"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-teal-200/75 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

const ChatInputForm = memo(function ChatInputForm({
  isBusy,
  clearNonce,
  onSendMessage,
  onStopGenerating,
}: {
  isBusy: boolean;
  clearNonce: number;
  onSendMessage: (trimmedText: string, honeypot: string) => boolean;
  onStopGenerating: () => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSubmitAtRef = useRef(0);

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  useEffect(() => {
    if (clearNonce > 0) {
      setInputValue('');
      setValidationError(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [clearNonce]);

  const submitCurrentInput = useCallback(() => {
    if (isBusy) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setValidationError('Please enter a message before sending.');
      textareaRef.current?.focus();
      return;
    }

    if (trimmed.length > 2000) {
      setValidationError('Messages cannot exceed 2000 characters.');
      textareaRef.current?.focus();
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAtRef.current < 700) {
      setValidationError('Please wait a moment before sending another message.');
      return;
    }

    const accepted = onSendMessage(trimmed, honeypotValue);
    if (accepted) {
      lastSubmitAtRef.current = now;
      setValidationError(null);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [honeypotValue, inputValue, isBusy, onSendMessage]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitCurrentInput();
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submitCurrentInput();
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="flex shrink-0 flex-col border-t border-teal-200/15 bg-[#041515]/95 px-3.5 py-2.5"
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
      <div className="flex items-end gap-2 rounded-2xl border border-teal-300/25 bg-[#082222]/90 px-3 py-1.5 shadow-inner transition-colors focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-400/20">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (validationError) setValidationError(null);
            syncTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask Pearl AI anything..."
          aria-label="Ask Pearl AI anything"
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? 'chat-validation-error' : undefined}
          maxLength={2001}
          className="no-scrollbar max-h-24 min-h-[34px] min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[16px] leading-snug text-white placeholder:text-[#9FC7C7]/85 focus:outline-none sm:text-[13px]"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={onStopGenerating}
            aria-label="Stop generating"
            title="Stop generating"
            className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-400/45 bg-rose-500/20 text-rose-200 transition-colors hover:bg-rose-500/35 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputValue.trim()}
            aria-label="Send message"
            title="Send message"
            className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[#031510] shadow-[0_0_16px_-3px_rgba(16,185,129,0.7)] transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800/35 disabled:text-teal-200/45 disabled:shadow-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {validationError ? (
        <p
          id="chat-validation-error"
          role="alert"
          className="mt-1.5 px-1 text-[11.5px] font-medium text-rose-300"
        >
          {validationError}
        </p>
      ) : (
        <p className="mt-1 hidden px-1 text-[10.5px] text-[#8FB4B4] sm:block">
          Enter to send · Shift+Enter for new line
        </p>
      )}
    </form>
  );
});

export function PortfolioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFaqSectionOpen, setIsFaqSectionOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [clearNonce, setClearNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [typingMsgId, setTypingMsgId] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    retryPayload: Array<{ role: 'user' | 'assistant'; content: string }>;
    honeypot: string;
  } | null>(null);

  const [position, setPosition] = useState<ChatPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const chatboxRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number>(0);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const positionRef = useRef<ChatPosition | null>(position);
  positionRef.current = position;
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeAnimRef = useRef<ActiveChatAnimState | null>(null);

  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    nextX: number;
    nextY: number;
    width: number;
    height: number;
    rafId: number;
  } | null>(null);

  const isBusy = isLoading || isThinking || typingMsgId !== null;

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRafRef.current) {
      window.cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const container = scrollContainerRef.current;
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    scrollToBottom(typingMsgId === null);
  }, [isOpen, messages, isLoading, isThinking, typingMsgId, errorInfo, scrollToBottom]);

  // Pause background 3D canvas while full-screen backdrop blur overlay is visible
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('portfolio:overlay-blur', {
        detail: { source: 'chatbot', active: isOpen },
      })
    );
    return () => {
      if (isOpen) {
        window.dispatchEvent(
          new CustomEvent('portfolio:overlay-blur', {
            detail: { source: 'chatbot', active: false },
          })
        );
      }
    };
  }, [isOpen]);

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
    window.addEventListener('resize', syncBounds, { passive: true });
    window.addEventListener('orientationchange', syncBounds, { passive: true });
    return () => {
      window.removeEventListener('resize', syncBounds);
      window.removeEventListener('orientationchange', syncBounds);
    };
  }, [isOpen]);

  // Cleanup active requests, rAF, and timers on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
      const active = activeAnimRef.current;
      if (active) {
        if (active.thinkingTimerId !== null) {
          window.clearTimeout(active.thinkingTimerId);
        }
        if (active.typingRafId !== null) {
          window.cancelAnimationFrame(active.typingRafId);
        }
        activeAnimRef.current = null;
      }
    };
  }, []);

  const handleOpenToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && !positionRef.current) {
        const { width, height } = getBoxDimensions();
        setPosition(getInitialPosition(width, height));
      }
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsDragging(false);
    if (dragStateRef.current?.rafId) {
      window.cancelAnimationFrame(dragStateRef.current.rafId);
    }
    dragStateRef.current = null;
  }, []);

  // Auto-close chatbox on outside click or Escape key
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

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown, true);
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleClose]);

  const stopTypingAnimation = useCallback((mode: 'keep-partial' | 'commit-full' | 'discard') => {
    const active = activeAnimRef.current;
    if (!active) return;

    if (active.thinkingTimerId !== null) {
      window.clearTimeout(active.thinkingTimerId);
    }
    if (active.typingRafId !== null) {
      window.cancelAnimationFrame(active.typingRafId);
    }
    activeAnimRef.current = null;
    setIsThinking(false);
    setTypingMsgId(null);

    if (mode === 'discard' || mode === 'keep-partial') {
      return;
    }

    if (active.phase === 'thinking') {
      setMessages((prev) => [
        ...prev,
        {
          id: active.assistantMsgId,
          role: 'assistant',
          content: active.fullAnswer,
          isFaq: active.isFaq,
          faqId: active.faqId,
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

  const startTypingReveal = useCallback(
    (fullText: string, options?: { isFaq?: boolean; faqId?: string }) => {
      stopTypingAnimation('commit-full');

      const assistantMsgId = createId();
      const animState: ActiveChatAnimState = {
        thinkingTimerId: null,
        typingRafId: null,
        assistantMsgId,
        fullAnswer: fullText,
        isFaq: Boolean(options?.isFaq),
        faqId: options?.faqId,
        phase: 'typing',
      };
      activeAnimRef.current = animState;
      setTypingMsgId(assistantMsgId);

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: fullText.slice(0, 1),
          isFaq: options?.isFaq,
          faqId: options?.faqId,
        },
      ]);

      if (fullText.length <= 1) {
        activeAnimRef.current = null;
        setTypingMsgId(null);
        return;
      }

      const startTime = performance.now();
      const totalDurationMs = Math.min(2200, Math.max(380, fullText.length * 10));
      let lastShownLength = 1;
      let lastCommitTime = startTime;

      const step = (now: number) => {
        if (activeAnimRef.current !== animState) return;

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / totalDurationMs);
        const nextLength =
          progress >= 1
            ? fullText.length
            : Math.max(lastShownLength, Math.floor(progress * fullText.length));

        const isDone = nextLength >= fullText.length;
        if (nextLength > lastShownLength && (isDone || now - lastCommitTime >= 24)) {
          lastShownLength = nextLength;
          lastCommitTime = now;
          const partial = fullText.slice(0, nextLength);
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: partial } : m))
          );
        }

        if (isDone) {
          animState.typingRafId = null;
          activeAnimRef.current = null;
          setTypingMsgId(null);
          return;
        }

        animState.typingRafId = window.requestAnimationFrame(step);
      };

      animState.typingRafId = window.requestAnimationFrame(step);
    },
    [stopTypingAnimation]
  );

  const handleStopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    inFlightRef.current = false;
    setIsLoading(false);
    stopTypingAnimation('keep-partial');
  }, [stopTypingAnimation]);

  const handleClearChat = useCallback(() => {
    stopTypingAnimation('discard');
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    inFlightRef.current = false;
    setIsLoading(false);
    setErrorInfo(null);
    setMessages([]);
    setClearNonce((n) => n + 1);
    setIsFaqSectionOpen(true);
  }, [stopTypingAnimation]);

  const handleToggleFaqSection = useCallback(() => {
    setIsFaqSectionOpen((prev) => {
      const next = !prev;
      if (next) {
        window.requestAnimationFrame(() => {
          scrollContainerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        });
      }
      return next;
    });
  }, []);

  const sendToGroq = useCallback(
    async (
      payloadMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
      honeypot: string
    ) => {
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
            website: honeypot,
          }),
          signal: controller.signal,
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setErrorInfo({
            message:
              'The AI chat service (/api/chat) returned an unexpected response. Please retry in a moment.',
            retryPayload: payloadMessages,
            honeypot,
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
            honeypot,
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
            honeypot,
          });
          return;
        }

        const replyText = data.reply?.trim();
        if (!replyText) {
          setErrorInfo({
            message: 'Received an empty reply from the assistant. Please retry.',
            retryPayload: payloadMessages,
            honeypot,
          });
          return;
        }

        inFlightRef.current = false;
        setIsLoading(false);
        startTypingReveal(replyText, { isFaq: false });
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') {
          if (timedOut) {
            setErrorInfo({
              message: 'The assistant request timed out. Please retry.',
              retryPayload: payloadMessages,
              honeypot,
            });
          }
          return;
        }
        setErrorInfo({
          message:
            'Network error while contacting Pearl AI. Please check your connection and retry.',
          retryPayload: payloadMessages,
          honeypot,
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
    [startTypingReveal]
  );

  const startFaqSequence = useCallback(
    (faq: FaqItem, appendUserMessage: boolean) => {
      if (inFlightRef.current || activeAnimRef.current) return;

      setErrorInfo(null);
      const assistantMsgId = createId();

      if (appendUserMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'user',
            content: faq.question,
            isFaq: true,
            faqId: faq.id,
          },
        ]);
      }

      setIsThinking(true);

      const animState: ActiveChatAnimState = {
        thinkingTimerId: null,
        typingRafId: null,
        assistantMsgId,
        fullAnswer: faq.answer,
        isFaq: true,
        faqId: faq.id,
        phase: 'thinking',
      };
      activeAnimRef.current = animState;

      animState.thinkingTimerId = window.setTimeout(() => {
        if (activeAnimRef.current !== animState) return;
        animState.thinkingTimerId = null;
        activeAnimRef.current = null;
        setIsThinking(false);
        startTypingReveal(faq.answer, { isFaq: true, faqId: faq.id });
      }, THINKING_DELAY_MS);
    },
    [startTypingReveal]
  );

  const handleFaqClick = useCallback(
    (faq: FaqItem) => {
      if (isBusy) return;
      startFaqSequence(faq, true);
    },
    [isBusy, startFaqSequence]
  );

  const handleSendMessage = useCallback(
    (trimmed: string, honeypot = ''): boolean => {
      if (inFlightRef.current || isBusy) return false;

      const userMsg: ChatMessage = {
        id: createId(),
        role: 'user',
        content: trimmed,
      };

      const nextHistory = [...messagesRef.current, userMsg];
      setMessages(nextHistory);
      setErrorInfo(null);

      const payload = nextHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      void sendToGroq(payload, honeypot);
      return true;
    },
    [isBusy, sendToGroq]
  );

  const handleRegenerate = useCallback(
    (assistantMsgId: string) => {
      if (inFlightRef.current || isBusy) return;

      const currentMessages = messagesRef.current;
      const targetIndex = currentMessages.findIndex((m) => m.id === assistantMsgId);
      if (targetIndex === -1) return;

      const targetMsg = currentMessages[targetIndex];
      const precedingMessages = currentMessages.slice(0, targetIndex);
      setMessages(precedingMessages);
      setErrorInfo(null);

      if (targetMsg.isFaq && targetMsg.faqId) {
        const matchedFaq = FAQ_ITEMS.find((item) => item.id === targetMsg.faqId);
        if (matchedFaq) {
          startFaqSequence(matchedFaq, false);
          return;
        }
      }

      const payload = precedingMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      void sendToGroq(payload, '');
    },
    [isBusy, sendToGroq, startFaqSequence]
  );

  const handleRetry = useCallback(() => {
    if (inFlightRef.current || isBusy || !errorInfo) return;
    void sendToGroq(errorInfo.retryPayload, errorInfo.honeypot);
  }, [errorInfo, isBusy, sendToGroq]);

  // Hardware-accelerated GPU header dragging (zero React re-renders while moving)
  const handleHeaderPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button')) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      const boxEl = chatboxRef.current;
      if (!boxEl) return;

      const rect = boxEl.getBoundingClientRect();
      const currentPos = positionRef.current ?? { x: rect.left, y: rect.top };

      dragStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: currentPos.x,
        originY: currentPos.y,
        nextX: currentPos.x,
        nextY: currentPos.y,
        width: rect.width,
        height: rect.height,
        rafId: 0,
      };

      boxEl.style.willChange = 'transform';
      setIsDragging(true);
      e.preventDefault();
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const applyDragTransform = () => {
      const drag = dragStateRef.current;
      const boxEl = chatboxRef.current;
      if (!drag) return;
      drag.rafId = 0;
      if (boxEl) {
        const tx = drag.nextX - drag.originX;
        const ty = drag.nextY - drag.originY;
        boxEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const clamped = clampPosition(
        drag.originX + dx,
        drag.originY + dy,
        drag.width,
        drag.height
      );
      drag.nextX = clamped.x;
      drag.nextY = clamped.y;

      if (!drag.rafId) {
        drag.rafId = window.requestAnimationFrame(applyDragTransform);
      }
    };

    const handlePointerEnd = (e: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      if (drag.rafId) {
        window.cancelAnimationFrame(drag.rafId);
      }
      const boxEl = chatboxRef.current;
      if (boxEl) {
        boxEl.style.transform = '';
        boxEl.style.willChange = '';
      }
      const finalPos = { x: drag.nextX, y: drag.nextY };
      dragStateRef.current = null;
      setPosition(finalPos);
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      if (dragStateRef.current?.rafId) {
        window.cancelAnimationFrame(dragStateRef.current.rafId);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isDragging]);

  const latestAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].id;
    }
    return null;
  }, [messages]);

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
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[35] pointer-events-auto bg-[#031010]/45 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Fixed Non-Draggable Chatbox Starter Launcher */}
      <ChatLauncher
        launcherRef={launcherRef}
        isOpen={isOpen}
        onToggle={handleOpenToggle}
      />

      {/* Opened Draggable Dark Teal Glassmorphism Chatbox with Smooth Open/Close Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="pearl-chatbox-frame"
            ref={chatboxRef}
            role="complementary"
            aria-label="Ask Sabari's Assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: `${resolvedPos.x}px`,
              top: `${resolvedPos.y}px`,
              width: `min(404px, calc(100vw - ${VIEWPORT_MARGIN * 2}px))`,
              height: `min(590px, calc(100dvh - ${VIEWPORT_MARGIN * 2}px))`,
            }}
            className="fixed z-40"
          >
            <motion.div
              key="pearl-chatbox-surface"
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-teal-300/25 bg-gradient-to-b from-[#072121]/95 via-[#051919]/95 to-[#041414]/97 text-white shadow-[0_28px_72px_-14px_rgba(0,0,0,0.92),0_0_38px_-12px_rgba(45,212,191,0.32),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl"
            >
              {/* Draggable Header */}
              <div
                onPointerDown={handleHeaderPointerDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                className="flex shrink-0 touch-none select-none items-center justify-between gap-2.5 border-b border-teal-200/15 bg-gradient-to-r from-[#0A2D2D]/95 via-[#072121]/95 to-[#0A2929]/95 px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/50 bg-[#030914] shadow-[0_0_12px_-2px_rgba(56,189,248,0.45)]">
                    <RobotMascot className="h-full w-full scale-105" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-sans text-sm font-bold leading-tight tracking-normal text-white">
                      Ask Sabari&apos;s Assistant
                    </h2>
                    <p className="truncate text-[11px] leading-tight text-teal-200/85">
                      PEARL AI · Drag header to move
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
                    <Trash2 className="h-4 w-4" />
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
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-teal-200/15 bg-[#041818]/92 px-3.5 py-2">
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

              {/* Scrollable FAQ + Welcome Message + Conversation History */}
              <div
                ref={scrollContainerRef}
                tabIndex={0}
                aria-label="Chat messages and FAQ"
                className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3.5 py-3 text-[13px] focus:outline-none"
              >
                {/* Frequently Asked Questions (5 Original Local FAQ Items) */}
                <FaqSection
                  isFaqSectionOpen={isFaqSectionOpen}
                  isBusy={isBusy}
                  onFaqClick={handleFaqClick}
                />

                {/* Friendly Welcome Message Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/45 bg-[#030914] shadow-[0_0_10px_-3px_rgba(56,189,248,0.45)]">
                    <RobotMascot className="h-full w-full scale-105" />
                  </div>
                  <div className="max-w-[86%] rounded-2xl rounded-tl-sm border border-teal-300/20 bg-[#082424]/90 px-3.5 py-2.5 text-[#E8F6F6] shadow-[0_8px_22px_-10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="leading-relaxed">{WELCOME_MESSAGE}</p>
                  </div>
                </div>

                {/* Conversation History Bubbles */}
                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    msg={msg}
                    isTypingThis={typingMsgId === msg.id}
                    isLatestAssistant={msg.id === latestAssistantId}
                    isBusy={isBusy}
                    onRegenerate={handleRegenerate}
                  />
                ))}

                {/* Animated Thinking... Indicator (AI & FAQ) */}
                {(isLoading || isThinking) && (
                  <div
                    aria-live="polite"
                    className="flex items-start gap-2.5"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/45 bg-[#030914] shadow-[0_0_10px_-3px_rgba(56,189,248,0.45)]">
                      <RobotMascot className="h-full w-full scale-105" />
                    </div>
                    <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-teal-300/20 bg-[#082424]/92 px-3.5 py-2.5 text-teal-100 shadow-sm">
                      <span className="flex items-center gap-1" aria-hidden="true">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.26s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-300 [animation-delay:-0.13s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300" />
                      </span>
                      <span className="text-xs font-medium text-teal-200/95">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Notice + Retry */}
                {errorInfo && !isBusy && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-400/35 bg-rose-950/55 px-3.5 py-2.5 text-xs text-rose-100 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                      <p className="min-w-0 flex-1 leading-relaxed">{errorInfo.message}</p>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 pl-6">
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/35 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Retry</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setErrorInfo(null)}
                        className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11.5px] font-medium text-rose-100/85 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Composer + Send / Stop Button */}
              <ChatInputForm
                isBusy={isBusy}
                clearNonce={clearNonce}
                onSendMessage={handleSendMessage}
                onStopGenerating={handleStopGenerating}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
