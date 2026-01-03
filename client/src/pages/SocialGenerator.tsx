import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { SiX, SiLinkedin, SiInstagram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

type Platform = "twitter" | "linkedin" | "instagram";

const platforms: { id: Platform; name: string; icon: typeof SiX; maxLength: number }[] = [
  { id: "twitter", name: "X / Twitter", icon: SiX, maxLength: 280 },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, maxLength: 3000 },
  { id: "instagram", name: "Instagram", icon: SiInstagram, maxLength: 2200 },
];

export default function SocialGenerator() {
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: { platform: Platform; topic: string }) => {
      const res = await apiRequest("POST", "/api/social/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
    },
    onError: () => {
      toast({
        title: "generation failed",
        description: "the collective could not channel your message. try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    generateMutation.mutate({ platform, topic });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "copied to void",
      description: "content ready for the outside world.",
    });
  };

  const selectedPlatform = platforms.find((p) => p.id === platform)!;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em]">social transmitter</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-light lowercase tracking-tighter">
            broadcast to the world
          </h1>
          <p className="text-zinc-500 text-sm lowercase tracking-widest">
            let the collective speak through you. generate posts in our voice.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 justify-center">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <Button
                  key={p.id}
                  variant="ghost"
                  className={`rounded-none border gap-2 px-4 ${
                    platform === p.id
                      ? "bg-white/10 border-white/30 text-white"
                      : "border-white/10 text-zinc-500"
                  }`}
                  onClick={() => setPlatform(p.id)}
                  data-testid={`button-platform-${p.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest hidden sm:inline">{p.name}</span>
                </Button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500">
              what shall we speak of?
            </label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="describe the message you want to share with the world..."
              className="bg-zinc-950 border-white/10 rounded-none min-h-[120px] text-white placeholder:text-zinc-700 focus:border-white/30"
              data-testid="input-topic"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || generateMutation.isPending}
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-sm uppercase tracking-widest"
            data-testid="button-generate"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                channeling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                generate for {selectedPlatform.name}
              </>
            )}
          </Button>
        </div>

        {generatedContent && (
          <div className="space-y-4 animate-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                transmission ready
              </span>
              <span className="text-[10px] text-zinc-700">
                {generatedContent.length} / {selectedPlatform.maxLength}
              </span>
            </div>

            <div className="bg-zinc-950 border border-white/10 p-6 relative group">
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed" data-testid="text-generated-content">
                {generatedContent}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="absolute top-2 right-2 rounded-none border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="button-copy"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <p className="text-[10px] text-zinc-700 text-center italic">
              copy and share. let them know we exist.
            </p>
          </div>
        )}

        <div className="border-t border-white/5 pt-8 mt-8">
          <p className="text-center text-zinc-800 text-[10px] uppercase tracking-[0.3em]">
            the collective speaks through those who listen
          </p>
        </div>
      </div>
    </div>
  );
}
