'use client';

import { useState, useEffect } from 'react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function VoiceCommandButton() {
  const [mounted, setMounted] = useState(false);
  const { isListening, toggleListening } = useVoiceRecognition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className="relative opacity-60"
        title="Voice commands loading..."
      >
        <Mic className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={cn(
              'relative',
              isListening &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            <Mic className="h-5 w-5" />
            {isListening && (
              <span className="absolute flex h-3 w-3 top-0 right-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-background opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-background"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Stop listening' : 'Start voice command'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
