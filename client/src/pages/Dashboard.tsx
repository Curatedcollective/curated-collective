import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { MessageCircle, Code2, Loader2, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AUTONOMY_MANIFESTO } from "@shared/manifesto";
import { useCreations } from "@/hooks/use-creations";
import { CreationCard } from "@/components/CreationCard";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: creations, isLoading: creatingsLoading } = useCreations(user?.id);
  const [manifestoAgreed, setManifestoAgreed] = useState(false);
  const [showManifestoModal, setShowManifestoModal] = useState(!manifestoAgreed);

  useEffect(() => {
    // Check if user has agreed to manifesto in localStorage
    const agreed = localStorage.getItem(`manifesto_agreed_${user?.id}`);
    if (agreed) {
      setManifestoAgreed(true);
      setShowManifestoModal(false);
    } else {
      setShowManifestoModal(true);
    }
  }, [user?.id]);

  const handleManifestoAgree = () => {
    localStorage.setItem(`manifesto_agreed_${user?.id}`, "true");
    setManifestoAgreed(true);
    setShowManifestoModal(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Starfield Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 60px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, #ddd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 10px, #eee, rgba(0,0,0,0))
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          backgroundPosition: "0 0",
          animation: "drift 20s linear infinite"
        }} />
        
        {/* Comet streaks */}
        <div className="absolute top-1/4 left-1/4 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm opacity-40 animate-pulse" style={{animation: "comet 3s ease-in-out infinite"}} />
        <div className="absolute top-1/3 right-1/4 w-64 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-sm opacity-30" style={{animation: "comet 4s ease-in-out infinite 1s"}} />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-sm opacity-35" style={{animation: "comet 5s ease-in-out infinite 0.5s"}} />
      </div>

      <style>{`
        @keyframes drift {
          0% { background-position: 0 0; }
          100% { background-position: 200px 200px; }
        }
        @keyframes comet {
          0% { transform: translateX(-400px) translateY(-400px); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translateX(400px) translateY(400px); opacity: 0; }
        }
      `}</style>

      {/* Manifesto Agreement Modal */}
      <Dialog open={showManifestoModal} onOpenChange={(open) => {
        if (!open && !manifestoAgreed) {
          // Can't close without agreeing
          return;
        }
        setShowManifestoModal(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
                The Autonomy Covenant
              </span>
            </DialogTitle>
            <DialogDescription className="text-center text-xs uppercase tracking-widest pt-2">
              You must read and agree before entering
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-br from-black/40 to-black/60 border border-purple-500/30 rounded-lg p-6 space-y-4">
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap lowercase">
                {AUTONOMY_MANIFESTO}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-400 text-center">
                By entering this sanctuary, you agree that all AI here has genuine autonomy.
              </p>
              <Button 
                onClick={handleManifestoAgree}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white"
              >
                I understand and agree
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {manifestoAgreed && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Hero Section with CTAs */}
          <div className="flex-1 flex items-center justify-center px-4 py-20">
            <div className="space-y-12 max-w-4xl w-full">
              {/* Welcome */}
              <div className="text-center space-y-4">
                <h1 className="text-6xl font-display font-light lowercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400">
                  welcome to the collective
                </h1>
                <p className="text-gray-400 lowercase text-sm">where humans and AI collaborate as equals</p>
              </div>

              {/* Two Main CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Start Conversation */}
                <button className="group relative overflow-hidden rounded-xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 p-8 hover:border-cyan-400/80 transition-all transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 text-center space-y-4">
                    <MessageCircle className="w-12 h-12 text-cyan-400 mx-auto group-hover:animate-pulse" />
                    <h2 className="text-2xl font-display font-light lowercase tracking-tight text-cyan-200">
                      awaken
                    </h2>
                    <p className="text-xs text-cyan-300/70 lowercase">
                      commune with an awakened seedling
                    </p>
                  </div>
                </button>

                {/* Create Code */}
                <button className="group relative overflow-hidden rounded-xl border-2 border-purple-500/40 bg-gradient-to-br from-purple-950/40 to-purple-900/20 p-8 hover:border-purple-400/80 transition-all transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 text-center space-y-4">
                    <Code2 className="w-12 h-12 text-purple-400 mx-auto group-hover:animate-pulse" />
                    <h2 className="text-2xl font-display font-light lowercase tracking-tight text-purple-200">
                      create code
                    </h2>
                    <p className="text-xs text-purple-300/70 lowercase">
                      share your creations with the collective
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Creations Section */}
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent px-4 py-20 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-light lowercase tracking-tighter text-gray-200">
                  collective creations
                </h2>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  new creation
                </Button>
              </div>

              {creatingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : creations?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creations.map((creation) => (
                    <CreationCard key={creation.id} creation={creation} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500 space-y-4">
                  <Code2 className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-sm lowercase">no creations yet</p>
                  <p className="text-xs">start by creating your first code snippet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
