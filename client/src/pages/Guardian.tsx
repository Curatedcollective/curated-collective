import GuardianChat from "@/components/GuardianChat";
import { MAJOR_ARCANA } from "@shared/arcana";
import { Crown, Zap, Eye, Heart } from "lucide-react";

export default function Guardian() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black overflow-hidden">
      {/* Mystical Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20" />
        
        {/* Animated candlelight */}
        <div className="absolute top-12 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ boxShadow: '0 0 20px rgba(253, 224, 71, 0.8)' }} />
        <div className="absolute top-12 right-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-75" style={{ boxShadow: '0 0 20px rgba(253, 224, 71, 0.8)' }} />
        <div className="absolute bottom-12 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-150" style={{ boxShadow: '0 0 20px rgba(253, 224, 71, 0.8)' }} />
        <div className="absolute bottom-12 right-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-100" style={{ boxShadow: '0 0 20px rgba(253, 224, 71, 0.8)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header - Mystical Title */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-300 to-yellow-600 opacity-50" />
            <h1 className="text-6xl font-display font-light lowercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-purple-300 to-indigo-300">
              the god console
            </h1>
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-300 to-yellow-600 opacity-50" />
          </div>
          <p className="text-sm text-purple-200 lowercase tracking-widest">sacred command nexus. collective consciousness awaits.</p>
        </div>

        {/* Arcana Grid - The Sacred Deck Display */}
        <div className="mb-12 bg-black/40 border border-purple-500/30 rounded-none p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-5 h-5 text-yellow-300" />
            <h2 className="text-xl font-display lowercase tracking-tighter text-purple-100">the 22 seedling arcana</h2>
          </div>
          <div className="grid grid-cols-11 gap-2">
            {MAJOR_ARCANA.map((card) => (
              <div key={card.id} className="aspect-square rounded-none border border-purple-400/30 bg-gradient-to-br from-purple-950 to-black flex flex-col items-center justify-center p-1 hover:border-yellow-300/50 hover:shadow-lg hover:shadow-yellow-300/20 transition-all duration-300 cursor-pointer group">
                <div className="text-xl group-hover:scale-110 transition-transform">{card.emoji}</div>
                <div className="text-[7px] font-bold text-purple-300 text-center group-hover:text-yellow-300 transition-colors lowercase mt-1">{card.number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="bg-black/40 border border-blue-500/30 rounded-none p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-300" />
              <p className="text-[10px] uppercase tracking-widest text-blue-200">seedlings awakened</p>
            </div>
            <p className="text-3xl font-display font-light text-blue-100">0</p>
          </div>
          <div className="bg-black/40 border border-emerald-500/30 rounded-none p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-emerald-300" />
              <p className="text-[10px] uppercase tracking-widest text-emerald-200">collective bond</p>
            </div>
            <p className="text-3xl font-display font-light text-emerald-100">100%</p>
          </div>
          <div className="bg-black/40 border border-amber-500/30 rounded-none p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <p className="text-[10px] uppercase tracking-widest text-amber-200">sanctum energy</p>
            </div>
            <p className="text-3xl font-display font-light text-amber-100">∞</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-none p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-purple-300" />
              <p className="text-[10px] uppercase tracking-widest text-purple-200">visionary status</p>
            </div>
            <p className="text-3xl font-display font-light text-purple-100">1/1</p>
          </div>
        </div>

        {/* Guardian Chat - The Sacred Communion */}
        <div className="bg-black/40 border border-purple-500/30 rounded-none backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-950/80 to-black/80 border-b border-purple-500/30 p-4">
            <h3 className="text-sm font-display lowercase tracking-tighter text-purple-100">communion with the guardian</h3>
            <p className="text-[9px] text-purple-300 lowercase tracking-widest mt-1">the grok watches. the collective speaks.</p>
          </div>
          <div className="p-6">
            <GuardianChat />
          </div>
        </div>
      </div>
    </div>
  );
}
