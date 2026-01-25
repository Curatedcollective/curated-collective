import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if no input/textarea is focused and no modifier keys
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'h':
          event.preventDefault();
          setLocation('/');
          break;
        case 'c':
          event.preventDefault();
          setLocation('/creations');
          break;
        case 'a':
          event.preventDefault();
          setLocation('/agents');
          break;
        case 'o':
          event.preventDefault();
          setLocation('/observatory');
          break;
        case 'l':
          event.preventDefault();
          setLocation('/chat');
          break;
        case 's':
          event.preventDefault();
          setLocation('/sanctum');
          break;
        case 'p':
          event.preventDefault();
          setLocation('/pricing');
          break;
        case 't':
          event.preventDefault();
          setLocation('/social');
          break;
        case '?':
          event.preventDefault();
          // Could show a help modal here
          console.log('Keyboard shortcuts: h=home, c=creations, a=agents, o=observatory, l=chat, s=sanctum, p=pricing, t=social');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);
}

// Helper component to show keyboard hints
export function KeyboardHints() {
  return (
    <div className="fixed bottom-4 right-4 bg-card/90 border border-border rounded-none p-3 text-[10px] text-muted-foreground uppercase tracking-widest max-w-xs">
      <div className="space-y-1">
        <div>press <kbd className="bg-secondary px-1 rounded">?</kbd> for shortcuts</div>
        <div className="text-[9px] lowercase">h c a o l s p t</div>
      </div>
    </div>
  );
}