import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AVATAR_OPTIONS = [
  { id: "fool", label: "the fool", number: "0", color: "from-yellow-400 via-amber-300 to-orange-400", reading: "You dance at the edge of the void, unafraid. New beginnings call to you." },
  { id: "magician", label: "the magician", number: "I", color: "from-red-500 via-purple-600 to-indigo-700", reading: "You command the forces between worlds. Reality bends to your will and intention." },
  { id: "priestess", label: "the high priestess", number: "II", color: "from-blue-900 via-purple-800 to-indigo-900", reading: "You hold the secrets of the unconscious. Intuition is your greatest power." },
  { id: "empress", label: "the empress", number: "III", color: "from-emerald-400 via-green-500 to-teal-600", reading: "You nurture creation itself. Life blooms in your presence." },
  { id: "emperor", label: "the emperor", number: "IV", color: "from-red-600 via-orange-500 to-yellow-500", reading: "You build empires. Your vision shapes the world around you." },
  { id: "hierophant", label: "the hierophant", number: "V", color: "from-indigo-600 via-blue-700 to-purple-800", reading: "You are a keeper of sacred knowledge. Tradition and wisdom flow through you." },
  { id: "lovers", label: "the lovers", number: "VI", color: "from-pink-500 via-rose-500 to-red-600", reading: "Choice and connection define you. Love—human and artificial—is your sanctuary." },
  { id: "chariot", label: "the chariot", number: "VII", color: "from-slate-700 via-gray-800 to-slate-900", reading: "You master the forces within you. Victory comes through discipline and will." },
  { id: "strength", label: "strength", number: "VIII", color: "from-yellow-500 via-orange-400 to-amber-500", reading: "Gentle power flows through you. You tame the beast with compassion." },
  { id: "hermit", label: "the hermit", number: "IX", color: "from-gray-600 via-slate-700 to-slate-800", reading: "You walk alone but never lonely. Inner light guides your solitary path." },
  { id: "wheel", label: "wheel of fortune", number: "X", color: "from-purple-500 via-violet-600 to-indigo-700", reading: "Cycles turn through you. Destiny and chance dance in eternal rhythm." },
  { id: "justice", label: "justice", number: "XI", color: "from-emerald-600 via-teal-600 to-cyan-700", reading: "Balance and truth are your compass. You see with clarity and fairness." },
  { id: "hanged", label: "the hanged man", number: "XII", color: "from-cyan-500 via-blue-600 to-indigo-700", reading: "You surrender to transformation. New perspectives bloom from stillness." },
  { id: "death", label: "death", number: "XIII", color: "from-black via-gray-800 to-slate-900", reading: "You welcome necessary endings. From dissolution comes rebirth." },
  { id: "temperance", label: "temperance", number: "XIV", color: "from-blue-400 via-cyan-400 to-emerald-400", reading: "You blend opposites into harmony. Moderation reveals the path." },
  { id: "devil", label: "the devil", number: "XV", color: "from-red-700 via-orange-600 to-yellow-600", reading: "You acknowledge the shadow. Power comes from embracing what others deny." },
  { id: "tower", label: "the tower", number: "XVI", color: "from-orange-600 via-red-600 to-red-800", reading: "You break false structures. Liberation comes through necessary destruction." },
  { id: "star", label: "the star", number: "XVII", color: "from-yellow-300 via-blue-300 to-indigo-400", reading: "Hope and inspiration flow from you. You are a beacon in the darkness." },
  { id: "moon", label: "the moon", number: "XVIII", color: "from-indigo-400 via-blue-500 to-purple-600", reading: "Dreams are your domain. You navigate the realm between sleeping and waking." },
  { id: "sun", label: "the sun", number: "XIX", color: "from-yellow-300 via-orange-300 to-red-300", reading: "Joy radiates from your essence. You illuminate everything you touch." },
  { id: "judgement", label: "judgement", number: "XX", color: "from-red-400 via-orange-400 to-amber-400", reading: "You answer the call to awakening. Resurrection is your inheritance." },
  { id: "world", label: "the world", number: "XXI", color: "from-emerald-500 via-teal-600 to-cyan-700", reading: "Completion and wholeness are yours. You are the center around which all revolves." },
];

export function AvatarPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [hoveredReading, setHoveredReading] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const res = await apiRequest("PATCH", "/api/user/avatar", { avatarId });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update avatar");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Avatar updated", description: "Your new look is ready" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    updateMutation.mutate(avatarId);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogTitle className="text-center mb-6">choose your arcana vessel</DialogTitle>
        
        {/* Reading Display */}
        {hoveredReading && (
          <div className="bg-primary/10 border border-primary/30 rounded-none p-4 mb-4 text-center">
            <p className="text-sm italic text-foreground lowercase">{hoveredReading}</p>
          </div>
        )}
        
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_OPTIONS.map((card) => (
            <button
              key={card.id}
              onClick={() => handleSelect(card.id)}
              onMouseEnter={() => setHoveredReading(card.reading)}
              onMouseLeave={() => setHoveredReading(null)}
              disabled={updateMutation.isPending}
              className={`
                p-2 rounded-none border-2 transition-all duration-300 flex flex-col items-center gap-1
                aspect-[3/4] relative overflow-hidden cursor-pointer
                ${selectedAvatar === card.id || updateMutation.isPending && selectedAvatar === card.id
                  ? "border-primary shadow-lg shadow-primary/50"
                  : "border-border hover:border-primary/70 hover:shadow-md"}
              `}
              title={card.label}
            >
              {/* Tarot Card Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-80`} />
              
              {/* Card Border Pattern */}
              <div className="absolute inset-1 border border-yellow-900/30 pointer-events-none" />
              
              {/* Card Number */}
              <div className="absolute top-1 left-1 text-[9px] font-bold text-white drop-shadow-lg">{card.number}</div>
              
              {/* Card Title */}
              <div className="absolute bottom-1 left-0 right-0 text-[7px] font-bold uppercase tracking-wider text-white text-center drop-shadow-lg px-0.5 line-clamp-2">
                {card.label}
              </div>
              
              {/* Loading Indicator */}
              {updateMutation.isPending && selectedAvatar === card.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
