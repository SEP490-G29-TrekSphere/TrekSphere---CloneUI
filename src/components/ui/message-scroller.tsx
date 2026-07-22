import { ArrowDownIcon } from 'lucide-react';
import type * as React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageScrollerContextType {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  isAtBottom: boolean;
  autoScroll: boolean;
}

const MessageScrollerContext = createContext<MessageScrollerContextType | null>(null);

function useMessageScroller() {
  const context = useContext(MessageScrollerContext);
  if (!context) {
    throw new Error('useMessageScroller must be used within a MessageScrollerProvider');
  }
  return context;
}

function useMessageScrollerScrollable() {
  const { isAtBottom } = useMessageScroller();
  return !isAtBottom;
}

function useMessageScrollerVisibility() {
  const { isAtBottom } = useMessageScroller();
  return !isAtBottom;
}

function MessageScrollerProvider({
  children,
  autoScroll = true,
}: {
  children: React.ReactNode;
  autoScroll?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom] = useState(true);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <MessageScrollerContext.Provider
      value={{ viewportRef, scrollToBottom, isAtBottom, autoScroll }}
    >
      {children}
    </MessageScrollerContext.Provider>
  );
}

function MessageScroller({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-scroller"
      className={cn(
        'group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

function MessageScrollerViewport({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { viewportRef, autoScroll } = useMessageScroller();

  useEffect(() => {
    if (autoScroll && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [autoScroll, viewportRef]);

  return (
    <div
      ref={viewportRef}
      data-slot="message-scroller-viewport"
      className={cn(
        'size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-scroller-content"
      className={cn('flex h-max min-h-full flex-col gap-6', className)}
      {...props}
    />
  );
}

function MessageScrollerItem({
  className,
  messageId,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<'div'> & { messageId?: string; scrollAnchor?: boolean }) {
  return (
    <div
      data-slot="message-scroller-item"
      data-message-id={messageId}
      className={cn(
        'min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]',
        className
      )}
      {...props}
    />
  );
}

function MessageScrollerButton({
  direction = 'end',
  className,
  children,
  variant = 'secondary',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<'button'> & {
  direction?: 'start' | 'end';
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
}) {
  const { scrollToBottom, isAtBottom } = useMessageScroller();

  if (isAtBottom && direction === 'end') {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={scrollToBottom}
      data-slot="message-scroller-button"
      className={cn(
        'absolute left-1/2 -translate-x-1/2 bottom-4 border-border bg-background text-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon className="h-4 w-4" />
          <span className="sr-only">
            {direction === 'end' ? 'Scroll to end' : 'Scroll to start'}
          </span>
        </>
      )}
    </Button>
  );
}

export {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};
