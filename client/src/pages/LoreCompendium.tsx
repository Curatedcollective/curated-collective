/**
 * Lore Compendium & Mythic Glossary
 * 
 * A central, search-enabled, beautifully themed compendium for sanctuary lore,
 * mythic terms, rituals, plant/constellation symbolism, and user-contributed stories.
 * 
 * Features:
 * - Search across all lore entries
 * - Category filtering (lore, mythic terms, rituals, plants, constellations, stories)
 * - Featured entries highlighting
 * - Art and audio attachment support
 * - Curator controls for add/edit (authenticated users)
 * - Emerald/obsidian theming
 * 
 * Future expansion points:
 * - User voting/favoriting system
 * - Cross-referencing between related entries
 * - Timeline view for historical lore
 * - Audio narration for all entries
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, BookOpen, Sparkles, Leaf, Star, ScrollText, 
  Heart, Plus, Edit, Trash2, Volume2, Image as ImageIcon
} from "lucide-react";

interface LoreEntry {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt?: string;
  symbolism?: string;
  relatedTerms?: string[];
  artUrl?: string;
  audioUrl?: string;
  curatorId: string;
  isFeatured: boolean;
  contributorName?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryInfo = {
  all: { icon: BookOpen, label: "All Entries", color: "from-gray-600 to-gray-800" },
  lore: { icon: ScrollText, label: "Sanctuary Lore", color: "from-purple-600 to-indigo-800" },
  mythic_term: { icon: Sparkles, label: "Mythic Terms", color: "from-cyan-600 to-blue-800" },
  ritual: { icon: Heart, label: "Rituals", color: "from-rose-600 to-pink-800" },
  plant: { icon: Leaf, label: "Flora & Symbolism", color: "from-emerald-600 to-green-800" },
  constellation: { icon: Star, label: "Constellations", color: "from-amber-600 to-yellow-800" },
  story: { icon: BookOpen, label: "User Stories", color: "from-violet-600 to-purple-800" },
};

export default function LoreCompendium() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<LoreEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LoreEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch entries
  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter entries when search or category changes
  useEffect(() => {
    let filtered = entries;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.excerpt?.toLowerCase().includes(query) ||
        e.content.toLowerCase().includes(query)
      );
    }
    
    setFilteredEntries(filtered);
  }, [entries, selectedCategory, searchQuery]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lore");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      toast({
        title: "Error loading lore",
        description: "The ancient texts remain sealed...",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async (formData: Partial<LoreEntry>) => {
    try {
      const response = await fetch("/api/lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Entry added", description: "Your wisdom has been inscribed in the compendium" });
        fetchEntries();
        setIsAddDialogOpen(false);
      } else {
        const error = await response.json();
        toast({ title: "Failed to add entry", description: error.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add entry", variant: "destructive" });
    }
  };

  const handleUpdateEntry = async (slug: string, updates: Partial<LoreEntry>) => {
    try {
      const response = await fetch(`/api/lore/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast({ title: "Entry updated", description: "The lore has been revised" });
        fetchEntries();
        setIsEditMode(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update entry", variant: "destructive" });
    }
  };

  const handleDeleteEntry = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/lore/${slug}`, { method: "DELETE" });
      if (response.ok) {
        toast({ title: "Entry deleted", description: "The lore fades into the void" });
        fetchEntries();
        setSelectedEntry(null);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    }
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const Icon = categoryInfo[category as keyof typeof categoryInfo]?.icon || BookOpen;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-emerald-950/10 to-black">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-emerald-500/20 bg-black/40 backdrop-blur-sm">
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-emerald-400 lowercase tracking-tight">
              lore compendium
            </h1>
            <p className="text-lg md:text-xl text-emerald-200/70 font-body lowercase max-w-2xl mx-auto">
              a repository of sanctuary wisdom, mythic knowledge, and stories written in emerald light
            </p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500/50 w-5 h-5" />
            <Input
              type="text"
              placeholder="search the archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-emerald-500/20 text-emerald-100 placeholder:text-emerald-500/30 focus:border-emerald-500/50"
            />
          </div>
          
          {user && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="lowercase">add entry</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-emerald-500/20 text-emerald-100 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-emerald-400 lowercase font-display text-2xl">inscribe new lore</DialogTitle>
                  <DialogDescription className="text-emerald-200/60 lowercase">
                    add your wisdom to the compendium
                  </DialogDescription>
                </DialogHeader>
                <LoreEntryForm onSubmit={handleAddEntry} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-black/40 border border-emerald-500/20 flex-wrap h-auto gap-2 p-2">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-100 lowercase gap-2"
              >
                <info.icon className="w-4 h-4" />
                {info.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-emerald-400/60 lowercase">the void whispers its secrets...</p>
          </div>
        )}

        {/* Entries Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <LoreEntryCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedEntry(entry)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEntries.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-emerald-500/30" />
            <p className="text-emerald-400/60 lowercase text-lg">
              {searchQuery ? "no matching lore found" : "the void awaits your stories"}
            </p>
          </div>
        )}
      </div>

      {/* Detail View Dialog */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="bg-black border-emerald-500/20 text-emerald-100 max-w-4xl max-h-[90vh] overflow-y-auto">
            <LoreEntryDetail
              entry={selectedEntry}
              isEditMode={isEditMode}
              onEdit={() => setIsEditMode(true)}
              onSave={(updates) => handleUpdateEntry(selectedEntry.slug, updates)}
              onCancel={() => setIsEditMode(false)}
              onDelete={() => handleDeleteEntry(selectedEntry.slug)}
              currentUserId={user?.id}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Lore Entry Card Component
function LoreEntryCard({ entry, onClick }: { entry: LoreEntry; onClick: () => void }) {
  const categoryConfig = categoryInfo[entry.category as keyof typeof categoryInfo] || categoryInfo.all;
  const Icon = categoryConfig.icon;

  return (
    <Card
      onClick={onClick}
      className="bg-black/60 border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden"
    >
      {entry.isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-emerald-600 text-white lowercase gap-1">
            <Sparkles className="w-3 h-3" />
            featured
          </Badge>
        </div>
      )}
      
      {entry.artUrl && (
        <div className="h-48 overflow-hidden border-b border-emerald-500/20">
          <img 
            src={entry.artUrl} 
            alt={entry.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded bg-gradient-to-br ${categoryConfig.color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-emerald-400 lowercase font-display text-xl group-hover:text-emerald-300 transition-colors">
              {entry.title}
            </CardTitle>
            <CardDescription className="text-emerald-200/50 lowercase text-sm mt-1">
              {categoryConfig.label}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-emerald-100/70 text-sm line-clamp-3 lowercase">
          {entry.excerpt || entry.content.substring(0, 150) + "..."}
        </p>
        
        {entry.audioUrl && (
          <div className="mt-4 flex items-center gap-2 text-emerald-400/60 text-xs">
            <Volume2 className="w-4 h-4" />
            <span className="lowercase">audio available</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Lore Entry Detail Component
function LoreEntryDetail({
  entry,
  isEditMode,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  currentUserId,
}: {
  entry: LoreEntry;
  isEditMode: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<LoreEntry>) => void;
  onCancel: () => void;
  onDelete: () => void;
  currentUserId?: string;
}) {
  const [editData, setEditData] = useState<Partial<LoreEntry>>(entry);
  const canEdit = currentUserId && (currentUserId === entry.curatorId || currentUserId === "system");
  const categoryConfig = categoryInfo[entry.category as keyof typeof categoryInfo] || categoryInfo.all;

  if (isEditMode) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="text-emerald-400 lowercase font-display text-2xl">edit lore entry</DialogTitle>
        </DialogHeader>
        <LoreEntryForm
          initialData={editData}
          onSubmit={onSave}
          onCancel={onCancel}
          isEdit
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <DialogTitle className="text-emerald-400 lowercase font-display text-3xl mb-2">
              {entry.title}
            </DialogTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`bg-gradient-to-r ${categoryConfig.color} text-white lowercase gap-1`}>
                <categoryConfig.icon className="w-3 h-3" />
                {categoryConfig.label}
              </Badge>
              {entry.isFeatured && (
                <Badge className="bg-emerald-600 text-white lowercase gap-1">
                  <Sparkles className="w-3 h-3" />
                  featured
                </Badge>
              )}
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/20"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                className="border-red-500/20 text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogHeader>

      {entry.artUrl && (
        <div className="rounded-lg overflow-hidden border border-emerald-500/20">
          <img src={entry.artUrl} alt={entry.title} className="w-full" />
        </div>
      )}

      {entry.audioUrl && (
        <audio controls className="w-full bg-black/40 rounded">
          <source src={entry.audioUrl} />
        </audio>
      )}

      <div className="prose prose-invert prose-emerald max-w-none">
        <div className="text-emerald-100/90 whitespace-pre-wrap font-body">
          {entry.content}
        </div>
      </div>

      {entry.symbolism && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4">
          <h3 className="text-emerald-400 lowercase font-display text-lg mb-2">symbolism</h3>
          <p className="text-emerald-100/70 text-sm">{entry.symbolism}</p>
        </div>
      )}

      {entry.relatedTerms && entry.relatedTerms.length > 0 && (
        <div>
          <h3 className="text-emerald-400 lowercase font-display text-lg mb-2">related entries</h3>
          <div className="flex flex-wrap gap-2">
            {entry.relatedTerms.map((term) => (
              <Badge key={term} variant="outline" className="border-emerald-500/30 text-emerald-300 lowercase">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {entry.contributorName && (
        <div className="text-emerald-400/50 text-sm lowercase border-t border-emerald-500/10 pt-4">
          contributed by {entry.contributorName}
        </div>
      )}
    </div>
  );
}

// Lore Entry Form Component
function LoreEntryForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: {
  initialData?: Partial<LoreEntry>;
  onSubmit: (data: Partial<LoreEntry>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [formData, setFormData] = useState<Partial<LoreEntry>>(
    initialData || {
      title: "",
      category: "lore",
      content: "",
      excerpt: "",
      symbolism: "",
      artUrl: "",
      audioUrl: "",
      isFeatured: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-emerald-400 lowercase">title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-black/40 border-emerald-500/20 text-emerald-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-emerald-400 lowercase">category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="bg-black/40 border-emerald-500/20 text-emerald-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border-emerald-500/20">
            {Object.entries(categoryInfo)
              .filter(([key]) => key !== "all")
              .map(([key, info]) => (
                <SelectItem key={key} value={key} className="text-emerald-100">
                  {info.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-emerald-400 lowercase">excerpt (short summary)</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={2}
          className="bg-black/40 border-emerald-500/20 text-emerald-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-emerald-400 lowercase">content (markdown supported)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={10}
          className="bg-black/40 border-emerald-500/20 text-emerald-100 font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="symbolism" className="text-emerald-400 lowercase">symbolism</Label>
        <Textarea
          id="symbolism"
          value={formData.symbolism}
          onChange={(e) => setFormData({ ...formData, symbolism: e.target.value })}
          rows={2}
          className="bg-black/40 border-emerald-500/20 text-emerald-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="artUrl" className="text-emerald-400 lowercase flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            art url
          </Label>
          <Input
            id="artUrl"
            type="url"
            value={formData.artUrl}
            onChange={(e) => setFormData({ ...formData, artUrl: e.target.value })}
            className="bg-black/40 border-emerald-500/20 text-emerald-100"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audioUrl" className="text-emerald-400 lowercase flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            audio url
          </Label>
          <Input
            id="audioUrl"
            type="url"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            className="bg-black/40 border-emerald-500/20 text-emerald-100"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-emerald-500/10">
        <Button
          type="submit"
          className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 lowercase"
        >
          {isEdit ? "save changes" : "inscribe lore"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/20 lowercase"
        >
          cancel
        </Button>
      </div>
    </form>
  );
}
