import { type Creation } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Code, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useDeleteCreation } from "@/hooks/use-creations";
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

export function CreationCard({ creation }: { creation: Creation }) {
  const deleteMutation = useDeleteCreation();

  return (
    <div className="group bg-card rounded-2xl border border-border p-5 hover-card-effect relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{creation.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(creation.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-secondary/50 rounded-xl text-primary">
          <Code className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-white/5 uppercase tracking-wide">
          {creation.language}
        </span>
      </div>

      <Link href={`/creations/${creation.id}`}>
        <h3 className="text-xl font-bold text-foreground mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-1">
          {creation.title}
        </h3>
      </Link>
      
      <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
        {creation.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
        <span>Updated {formatDistanceToNow(new Date(creation.updatedAt || new Date()), { addSuffix: true })}</span>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    </div>
  );
}
