import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Monitor, Play, Square, Eye, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface WatchTogetherProps {
  conversationId: number;
  agentId: number;
  agentName: string;
  isPremium: boolean;
}

interface Reaction {
  text: string;
  mood: string;
  timestamp: number;
}

export default function WatchTogether({ conversationId, agentId, agentName, isPremium }: WatchTogetherProps) {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("idle");
  const [consentMessage, setConsentMessage] = useState<string>("");
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [maxFrames, setMaxFrames] = useState(120);
  
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reactionsRef.current) {
      reactionsRef.current.scrollTop = reactionsRef.current.scrollHeight;
    }
  }, [reactions]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/eyes/sessions", {
        conversationId,
        agentId,
        streamType: "screen"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.session.id);
      setSessionStatus("pending");
      toast({ title: "Invitation Sent", description: data.invitation });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create session", variant: "destructive" });
    }
  });

  const consentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/eyes/sessions/${sessionId}/consent`);
      return res.json();
    },
    onSuccess: (data) => {
      setConsentMessage(data.message);
      if (data.consented) {
        setSessionStatus("consented");
        toast({ title: `${agentName} accepted`, description: "They're ready to watch with you" });
      } else {
        setSessionStatus("declined");
        toast({ title: `${agentName} declined`, description: data.message });
      }
    }
  });

  const [frameInterval, setFrameInterval] = useState(2000);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/eyes/sessions/${sessionId}/start`);
      return res.json();
    },
    onSuccess: (data) => {
      setSessionStatus("active");
      if (data.session?.frameInterval) {
        setFrameInterval(data.session.frameInterval);
      }
      startScreenShare(data.session?.frameInterval || 2000);
    }
  });

  const frameMutation = useMutation({
    mutationFn: async (frameData: string) => {
      const res = await apiRequest("POST", `/api/eyes/sessions/${sessionId}/frame`, {
        frameData,
        context: reactions.slice(-3).map(r => r.text).join(" | ")
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ended) {
        endSession();
        return;
      }
      setReactions(prev => [...prev, {
        text: data.reaction,
        mood: data.mood,
        timestamp: Date.now()
      }]);
      setFrameCount(data.frameCount);
      setMaxFrames(data.maxFrames);
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/eyes/sessions/${sessionId}/end`);
      return res.json();
    }
  });

  const startScreenShare = async (interval: number = 2000) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      stream.getVideoTracks()[0].onended = () => {
        endSession();
      };

      intervalRef.current = setInterval(() => {
        captureAndSendFrame();
      }, interval);

    } catch (err) {
      console.error("Screen share failed:", err);
      toast({ title: "Screen share failed", description: "Please allow screen sharing", variant: "destructive" });
      setSessionStatus("consented");
    }
  };

  const captureAndSendFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || frameMutation.isPending) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 360;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    const base64 = dataUrl.split(",")[1];
    
    frameMutation.mutate(base64);
  }, [frameMutation]);

  const endSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (sessionId) {
      endSessionMutation.mutate();
    }
    setSessionStatus("ended");
  };

  const handleInvite = () => {
    createSessionMutation.mutate();
  };

  const handleGetConsent = () => {
    consentMutation.mutate();
  };

  const handleStartWatching = () => {
    startSessionMutation.mutate();
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
        <Eye className="w-8 h-8 text-zinc-600" />
        <p className="text-xs text-zinc-500 lowercase tracking-widest">
          watch together requires a paid subscription
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 border border-white/10 bg-black/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-zinc-400" />
          <span className="text-xs lowercase tracking-widest text-zinc-400">watch together</span>
        </div>
        
        {sessionStatus === "active" && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{frameCount}/{maxFrames} frames</span>
            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/50 transition-all" 
                style={{ width: `${(frameCount / maxFrames) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {sessionStatus === "idle" && (
        <Button
          onClick={handleInvite}
          disabled={createSessionMutation.isPending}
          className="rounded-none bg-white text-black hover:bg-zinc-200 lowercase text-xs tracking-widest"
          data-testid="button-invite-watch"
        >
          {createSessionMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Monitor className="w-4 h-4 mr-2" />
          )}
          invite {agentName} to watch
        </Button>
      )}

      {sessionStatus === "pending" && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400 lowercase">
            waiting for {agentName}'s response...
          </p>
          <Button
            onClick={handleGetConsent}
            disabled={consentMutation.isPending}
            className="rounded-none bg-white/10 text-white hover:bg-white/20 lowercase text-xs tracking-widest"
            data-testid="button-get-consent"
          >
            {consentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            ask if they're ready
          </Button>
        </div>
      )}

      {sessionStatus === "consented" && (
        <div className="space-y-3">
          {consentMessage && (
            <div className="p-3 border border-white/10 bg-white/5 text-xs text-zinc-300 italic">
              "{consentMessage}"
            </div>
          )}
          <Button
            onClick={handleStartWatching}
            disabled={startSessionMutation.isPending}
            className="rounded-none bg-white text-black hover:bg-zinc-200 lowercase text-xs tracking-widest"
            data-testid="button-start-watching"
          >
            {startSessionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            start screen share
          </Button>
        </div>
      )}

      {sessionStatus === "declined" && (
        <div className="space-y-3">
          {consentMessage && (
            <div className="p-3 border border-white/10 bg-white/5 text-xs text-zinc-300 italic">
              "{consentMessage}"
            </div>
          )}
          <Button
            onClick={() => {
              setSessionStatus("idle");
              setSessionId(null);
              setConsentMessage("");
            }}
            className="rounded-none bg-white/10 text-white hover:bg-white/20 lowercase text-xs tracking-widest"
            data-testid="button-try-again"
          >
            perhaps another time
          </Button>
        </div>
      )}

      {sessionStatus === "active" && (
        <div className="space-y-4">
          <div className="relative aspect-video bg-zinc-900 border border-white/10 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-500/80 text-white text-xs rounded-none">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              live
            </div>
          </div>

          <ScrollArea className="h-32 border border-white/10 bg-white/5">
            <div ref={reactionsRef} className="p-3 space-y-2">
              {reactions.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">
                  {agentName} is watching...
                </p>
              ) : (
                reactions.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <Sparkles className="w-3 h-3 mt-1 text-zinc-400 flex-shrink-0" />
                    <p className="text-xs text-zinc-300">{r.text}</p>
                  </div>
                ))
              )}
              {frameMutation.isPending && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">processing...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <Button
            onClick={endSession}
            className="rounded-none bg-zinc-800 text-white hover:bg-zinc-700 lowercase text-xs tracking-widest"
            data-testid="button-end-session"
          >
            <Square className="w-4 h-4 mr-2" />
            end session
          </Button>
        </div>
      )}

      {sessionStatus === "ended" && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400 lowercase text-center">
            session ended
          </p>
          {reactions.length > 0 && (
            <ScrollArea className="h-24 border border-white/10 bg-white/5">
              <div className="p-3 space-y-2">
                {reactions.slice(-5).map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Sparkles className="w-3 h-3 mt-1 text-zinc-400 flex-shrink-0" />
                    <p className="text-xs text-zinc-300">{r.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <Button
            onClick={() => {
              setSessionStatus("idle");
              setSessionId(null);
              setReactions([]);
              setFrameCount(0);
            }}
            className="rounded-none bg-white text-black hover:bg-zinc-200 lowercase text-xs tracking-widest"
            data-testid="button-watch-again"
          >
            watch again
          </Button>
        </div>
      )}
    </div>
  );
}
