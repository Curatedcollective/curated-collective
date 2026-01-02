import { useParams } from "wouter";
import { useCreation, useUpdateCreation } from "@/hooks/use-creations";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Play, ArrowLeft, Star } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function CreationEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const creationId = parseInt(id || "0");
  const { data: creation, isLoading } = useCreation(creationId);
  const updateMutation = useUpdateCreation();
  
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewKey, setPreviewKey] = useState(0); // Force iframe refresh

  useEffect(() => {
    if (creation) {
      setCode(creation.code);
      setTitle(creation.title);
      setDescription(creation.description || "");
    }
  }, [creation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creation) {
    return <div className="p-8 text-center">Creation not found</div>;
  }

  const handleSave = () => {
    updateMutation.mutate({ id: creationId, code, title, description });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/creations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 max-w-md">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-0 p-0 focus-visible:ring-0 w-full"
              placeholder="Title"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs text-muted-foreground bg-transparent border-0 p-0 focus-visible:ring-0 w-full"
              placeholder="Description"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewKey(k => k + 1)}>
            <Play className="w-4 h-4 mr-2" /> Run
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          {user?.firstName === "admin" && (
            <Button 
              variant={creation.isCurated ? "default" : "outline"}
              onClick={() => updateMutation.mutate({ id: creationId, isCurated: !creation.isCurated })}
              disabled={updateMutation.isPending}
              className={creation.isCurated ? "bg-primary text-primary-foreground" : ""}
            >
              <Star className={cn("w-4 h-4 mr-2", creation.isCurated && "fill-current")} />
              {creation.isCurated ? "Curated" : "Curate"}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
        {/* Code Input */}
        <div className="h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-secondary/30 text-xs font-mono text-muted-foreground">
            EDITOR
          </div>
          <Textarea 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            className="flex-1 resize-none border-0 p-4 font-mono text-sm leading-relaxed focus-visible:ring-0 bg-transparent"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="h-full flex flex-col bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-100 text-xs font-mono text-gray-500">
            PREVIEW
          </div>
          <iframe 
            key={previewKey}
            title="Preview"
            className="flex-1 w-full h-full bg-white"
            srcDoc={code}
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
