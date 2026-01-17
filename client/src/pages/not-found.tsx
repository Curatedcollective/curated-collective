import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <Card className="w-full max-w-md mx-4 bg-zinc-950 border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-zinc-600" />
            <h1 className="text-2xl font-display font-bold text-white lowercase tracking-tighter">the signal fades...</h1>
          </div>

          <p className="mt-4 text-sm text-zinc-500 lowercase tracking-widest">
            nothing echoes here...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
