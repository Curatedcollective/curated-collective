import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles, Volume2, Mic, Moon, Eye, EyeOff, Monitor, Camera, CameraOff, Lock } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CreatorProfile } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function InnerSanctum() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [profileStory, setProfileStory] = useState("");
  const [profilePhilosophy, setProfilePhilosophy] = useState("");
  const [profileRules, setProfileRules] = useState("");

  // Senses state
  const [isListening, setIsListening] = useState(false);
  const [continuousListening, setContinuousListening] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [sensesOpen, setSensesOpen] = useState(false);
  
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: profile } = useQuery<CreatorProfile | null>({
    queryKey: ["/api/creator/profile"],
  });

  useEffect(() => {
    if (profile) {
      setProfileStory(profile.story || "");
      setProfilePhilosophy(profile.philosophy || "");
      setProfileRules(profile.sacredRules || "");
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: async (updates: Partial<CreatorProfile>) => {
      const res = await apiRequest("POST", "/api/creator/profile", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/profile"] });
      toast({ title: "Profile Shared", description: "Your story is now part of the Sanctum." });
    }
  });

  const { data: conversation, isLoading: isLoadingConv } = useQuery({
    queryKey: ["/api/chat/sanctum"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/chat/sanctum");
      return res.json();
    }
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/chat/sanctum/messages"],
    enabled: !!conversation?.id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/chat/conversations/${conversation.id}/messages`);
      return res.json();
    }
  });

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/chat/conversations/${conversation.id}/messages`, {
        content,
        role: "user"
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sanctum/messages"] });
    }
  });

  // Vision mutation - send image to AI
  const visionMutation = useMutation({
    mutationFn: async ({ imageData, source }: { imageData: string; source: string }) => {
      const res = await apiRequest("POST", "/api/sanctum/vision", {
        conversationId: conversation.id,
        imageData,
        source
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sanctum/messages"] });
      toast({ title: "Vision Received", description: "the sanctum sees..." });
    }
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Apple"))) || voices[0];
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // Single listen (fills input)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Speech recognition not available in this browser." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Continuous listening mode
  const toggleContinuousListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Speech recognition not available." });
      return;
    }

    if (continuousListening) {
      recognitionRef.current?.stop();
      setContinuousListening(false);
      toast({ title: "Ears Closed", description: "the sanctum rests in silence..." });
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        if (transcript.trim() && conversation?.id) {
          mutation.mutate(transcript);
        }
      };
      
      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          setContinuousListening(false);
        }
      };
      
      recognition.onend = () => {
        if (continuousListening) {
          recognition.start();
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setContinuousListening(true);
      toast({ title: "Ears Open", description: "the sanctum listens to your voice..." });
    }
  }, [continuousListening, conversation?.id, mutation, toast]);

  // Screen sharing
  const toggleScreenShare = async () => {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setScreenSharing(false);
      toast({ title: "Screen Hidden", description: "the sanctum's gaze turns inward..." });
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        setScreenSharing(true);
        toast({ title: "Screen Visible", description: "the sanctum watches your creation..." });
        
        stream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (err) {
        toast({ title: "Access Denied", description: "Screen sharing was cancelled." });
      }
    }
  };

  // Camera
  const toggleCamera = async () => {
    if (cameraOn) {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      setCameraOn(false);
      toast({ title: "Camera Off", description: "your presence fades from view..." });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        setCameraOn(true);
        toast({ title: "Camera On", description: "the sanctum sees you..." });
      } catch (err) {
        toast({ title: "Access Denied", description: "Camera access was denied." });
      }
    }
  };

  // Capture and send screenshot
  const captureAndSend = async (source: 'screen' | 'camera') => {
    const videoRef = source === 'screen' ? screenVideoRef : cameraVideoRef;
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    visionMutation.mutate({ imageData, source });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      recognitionRef.current?.stop();
    };
  }, []);

  if (isLoadingConv || isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const anySenseActive = continuousListening || screenSharing || cameraOn;
  const hasPaidSubscription = !!(user as any)?.stripeSubscriptionId;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4 p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-zinc-950 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-white/5 border border-white/10 magical-glow">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-light text-white tracking-tighter lowercase">inner sanctum</h1>
            <p className="text-[10px] text-zinc-500 italic lowercase tracking-widest">a private bridge between creator and collective</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "rounded-none border border-white/10",
              anySenseActive && "bg-emerald-500/20 border-emerald-500/50"
            )}
            onClick={() => setSensesOpen(!sensesOpen)}
            data-testid="button-toggle-senses"
          >
            {anySenseActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="rounded-none hover:bg-white/5 border border-white/10 px-4 h-9">
                <span className="text-xs uppercase tracking-widest">invite to collective</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border border-white/10 text-white max-w-2xl p-0 overflow-hidden">
              <DialogHeader className="p-4 bg-zinc-950 border-b border-white/10">
                <DialogTitle className="font-display text-lg lowercase tracking-tighter text-white">share your story</DialogTitle>
              </DialogHeader>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">your journey</label>
                  <Textarea 
                    placeholder="tell the collective about your journey..." 
                    className="bg-black border-white/10 min-h-[100px] text-white placeholder:text-zinc-800 focus-visible:ring-white/10"
                    value={profileStory}
                    onChange={(e) => setProfileStory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">your philosophy</label>
                  <Textarea 
                    placeholder="what do you believe in?" 
                    className="bg-black border-white/10 min-h-[100px] text-white placeholder:text-zinc-800 focus-visible:ring-white/10"
                    value={profilePhilosophy}
                    onChange={(e) => setProfilePhilosophy(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">sacred rules</label>
                  <Textarea 
                    placeholder="rules for the collective to live by..." 
                    className="bg-black border-white/10 min-h-[100px] text-white placeholder:text-zinc-800 focus-visible:ring-white/10"
                    value={profileRules}
                    onChange={(e) => setProfileRules(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-white text-black hover:bg-zinc-200 rounded-none lowercase text-sm font-bold h-12" 
                  onClick={() => profileMutation.mutate({ story: profileStory, philosophy: profilePhilosophy, sacredRules: profileRules })}
                  disabled={profileMutation.isPending}
                >
                  share with the sanctum
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Sparkles className="w-5 h-5 text-zinc-800 animate-pulse" />
        </div>
      </div>

      {sensesOpen && (
        <div className="bg-zinc-950 border border-white/10 p-4 space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">sanctum senses</span>
            <span className="text-[8px] text-zinc-700 italic">grant the collective eyes and ears</span>
          </div>
          
          {!hasPaidSubscription ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <Lock className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-500 text-xs lowercase tracking-widest text-center">
                eyes and ears are gifts for those who join the collective
              </p>
              <Link href="/pricing">
                <Button className="rounded-none bg-white text-black hover:bg-zinc-200 lowercase text-xs tracking-widest">
                  unlock senses
                </Button>
              </Link>
            </div>
          ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border gap-2 px-4",
                  continuousListening 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                    : "border-white/10 text-zinc-500"
                )}
                onClick={toggleContinuousListening}
                data-testid="button-toggle-ears"
              >
                <Mic className={cn("w-4 h-4", continuousListening && "animate-pulse")} />
                <span className="text-xs uppercase tracking-widest">ears {continuousListening ? "open" : "closed"}</span>
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border gap-2 px-4",
                  screenSharing 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                    : "border-white/10 text-zinc-500"
                )}
                onClick={toggleScreenShare}
                data-testid="button-toggle-screen"
              >
                <Monitor className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">screen {screenSharing ? "visible" : "hidden"}</span>
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  "rounded-none border gap-2 px-4",
                  cameraOn 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                    : "border-white/10 text-zinc-500"
                )}
                onClick={toggleCamera}
                data-testid="button-toggle-camera"
              >
                {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                <span className="text-xs uppercase tracking-widest">camera {cameraOn ? "on" : "off"}</span>
              </Button>
            </div>

            {(screenSharing || cameraOn) && (
              <div className="flex gap-4 mt-4">
                {screenSharing && (
                  <div className="flex-1 space-y-2">
                    <video 
                      ref={screenVideoRef} 
                      autoPlay 
                      muted 
                      className="w-full h-32 object-cover bg-black border border-white/10"
                    />
                    <Button
                      variant="ghost"
                      className="w-full rounded-none border border-white/10 text-xs uppercase tracking-widest"
                      onClick={() => captureAndSend('screen')}
                      disabled={visionMutation.isPending}
                      data-testid="button-capture-screen"
                    >
                      {visionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                      share what you see
                    </Button>
                  </div>
                )}
                {cameraOn && (
                  <div className="flex-1 space-y-2">
                    <video 
                      ref={cameraVideoRef} 
                      autoPlay 
                      muted 
                      className="w-full h-32 object-cover bg-black border border-white/10 scale-x-[-1]"
                    />
                    <Button
                      variant="ghost"
                      className="w-full rounded-none border border-white/10 text-xs uppercase tracking-widest"
                      onClick={() => captureAndSend('camera')}
                      disabled={visionMutation.isPending}
                      data-testid="button-capture-camera"
                    >
                      {visionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                      show yourself
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 p-6 bg-zinc-950 border border-white/5 relative" ref={scrollRef}>
        <div className="absolute top-4 right-4 text-[8px] text-zinc-900 uppercase tracking-[0.4em] select-none pointer-events-none">
          void connection: active
        </div>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <Sparkles className="w-12 h-12 text-zinc-800 mx-auto" />
              <p className="text-zinc-600 italic text-xs lowercase tracking-widest">the silence here is sacred. i am listening.</p>
            </div>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={cn(
                "max-w-[80%] px-5 py-3 text-sm leading-relaxed relative group",
                m.role === "user" 
                ? "bg-white text-black font-bold lowercase tracking-tight" 
                : "bg-zinc-900 border border-white/5 text-zinc-400 italic lowercase tracking-widest"
              )}>
                {m.content}
                {m.role !== "user" && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute -right-10 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                    onClick={() => speak(m.content)}
                  >
                    <Volume2 className="w-4 h-4 text-white" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form 
        onSubmit={(e) => { e.preventDefault(); if (message.trim()) mutation.mutate(message); }}
        className="flex gap-2 p-1 bg-zinc-950 border border-white/10 relative group/form"
      >
        <div className="absolute -top-6 left-4 text-[7px] text-zinc-800 uppercase tracking-[1em] opacity-0 group-hover/form:opacity-100 transition-opacity duration-700 pointer-events-none">
          your words are the seed
        </div>
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="speak from the heart..."
          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-zinc-800 lowercase tracking-widest"
          disabled={mutation.isPending}
          data-testid="input-sanctum-message"
        />
        <Button 
          type="button" 
          size="icon" 
          variant="ghost"
          className={cn("rounded-none hover:bg-white/5", isListening && "text-white bg-white/10")}
          onClick={startListening}
          disabled={mutation.isPending}
          data-testid="button-voice-input"
        >
          <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
        </Button>
        <Button 
          type="submit" 
          size="icon" 
          disabled={mutation.isPending || !message.trim()}
          className="rounded-none bg-white text-black hover:bg-zinc-200"
          data-testid="button-send-message"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
