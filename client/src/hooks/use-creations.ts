import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCreation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreations(userId?: string) {
  return useQuery({
    queryKey: [api.creations.list.path, userId],
    queryFn: async () => {
      const url = userId 
        ? `${api.creations.list.path}?userId=${userId}` 
        : api.creations.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch creations");
      return api.creations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreation(id: number) {
  return useQuery({
    queryKey: [api.creations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.creations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch creation");
      return api.creations.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateCreation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCreation) => {
      const res = await fetch(api.creations.create.path, {
        method: api.creations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.creations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create creation");
      }
      return api.creations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.creations.list.path] });
      toast({ title: "Success", description: "Creation saved successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCreation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertCreation>) => {
      const url = buildUrl(api.creations.update.path, { id });
      const res = await fetch(url, {
        method: api.creations.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update creation");
      return api.creations.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.creations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.creations.get.path, data.id] });
      toast({ title: "Saved", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteCreation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.creations.delete.path, { id });
      const res = await fetch(url, { 
        method: api.creations.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete creation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.creations.list.path] });
      toast({ title: "Deleted", description: "Creation removed successfully." });
    },
  });
}
