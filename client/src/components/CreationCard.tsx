import { type Creation } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Code, Trash2, Star, Share2, Copy, Check } from "lucide-react";
import { SiX, SiLinkedin } from "react-icons/si";
import { Button } from "./ui/button";
import { useDeleteCreation } from "@/hooks/use-creations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CreationCard({ creation }: { creation: Creation }) {
  const deleteMutation = useDeleteCreation();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const creationUrl = `${window.location.origin}/creations/${creation.id}`;
  const shareText = `Check out "${creation.title}" on Curated Collective - where autonomous AI and code converge.`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(creationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "link copied",
      description: "share this creation with the world.",
    });
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(creationUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(creationUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn(
      "group bg-zinc-950 border border-white/5 p-6 hover:border-white/20 transition-all relative overflow-hidden flex flex-col h-full rounded-none",
      creation.isCurated && "border-white/20"
    )}>
      {creation.isCurated && (
        <div className="absolute top-4 right-4 bg-white text-black text-[8px] px-2 py-0.5 font-bold uppercase tracking-[0.2em] z-10 flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-black" />
          curated
        </div>
      )}
      
      {/* Action buttons - delete and share */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-white/10" data-testid={`button-share-${creation.id}`}>
              <Share2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-950 border-white/10 rounded-none" align="end">
            <DropdownMenuItem 
              onClick={handleCopyLink}
              className="rounded-none text-xs lowercase tracking-widest cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 mr-2 text-emerald-400" /> : <Copy className="w-3 h-3 mr-2" />}
              copy link
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleShareTwitter}
              className="rounded-none text-xs lowercase tracking-widest cursor-pointer"
            >
              <SiX className="w-3 h-3 mr-2" />
              share on x
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleShareLinkedIn}
              className="rounded-none text-xs lowercase tracking-widest cursor-pointer"
            >
              <SiLinkedin className="w-3 h-3 mr-2" />
              share on linkedin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-red-500/10 hover:text-red-500" data-testid={`button-delete-${creation.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black border border-white/10 rounded-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white font-display lowercase tracking-tighter">delete creation?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-500 text-xs lowercase tracking-widest">
                this will permanently delete "{creation.title}". this action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-white/10 hover:bg-white/5">cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(creation.id)} className="rounded-none bg-white text-black hover:bg-zinc-200">
                delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-white/5 border border-white/5 text-white">
          <Code className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold px-2 py-1 bg-zinc-900 text-zinc-500 border border-white/5 uppercase tracking-widest">
          {creation.language}
        </span>
      </div>

      <Link href={`/creations/${creation.id}`}>
        <h3 className="text-xl font-display font-bold text-white mb-2 cursor-pointer hover:text-zinc-300 transition-colors line-clamp-1 lowercase tracking-tighter">
          {creation.title}
        </h3>
      </Link>
      
      <p className="text-zinc-500 text-xs mb-8 line-clamp-2 flex-grow lowercase tracking-widest leading-relaxed">
        {creation.description || "no description provided."}
      </p>

      <div className="flex items-center justify-between text-[10px] text-zinc-700 mt-auto pt-4 border-t border-white/5 uppercase tracking-[0.2em]">
        <span>updated {formatDistanceToNow(new Date(creation.updatedAt || new Date()), { addSuffix: true })}</span>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />
    </div>
  );
}
