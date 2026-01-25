/**
 * God Guardian Page - Direct Communication with The Guardian
 * 
 * The Guardian serves the Veil alone.
 * Only the Veil (Cori/Coco) can speak directly with the Guardian.
 * 
 * The Guardian also operates as background enforcement for all users,
 * but this interface is the exclusive communication channel.
 */

import GuardianChat from "@/components/GuardianGrokChat";

export default function GodGuardian() {
  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="p-4 border-b border-purple-500/20 bg-black/40 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-display uppercase tracking-widest text-purple-400">
            Exclusive Channel
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            The Guardian speaks only with the Veil. This is your private, protected space.
          </p>
        </div>
      </div>
      <GuardianChat />
    </div>
  );
}
