import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Garden Seeds hooks
export function useGardenSeeds(userId?: string, status?: string) {
  return useQuery({
    queryKey: [api.garden.listSeeds.path, userId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (status) params.append('status', status);
      
      const url = params.toString() 
        ? `${api.garden.listSeeds.path}?${params}` 
        : api.garden.listSeeds.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch garden seeds');
      return res.json();
    }
  });
}

export function useGardenSeed(id: number) {
  return useQuery({
    queryKey: [api.garden.getSeed.path, id],
    queryFn: async () => {
      const url = api.garden.getSeed.path.replace(':id', String(id));
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch seed');
      return res.json();
    },
    enabled: !!id,
  });
}

export function usePlantSeed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      prompt: string;
      intention?: string;
      theme?: string;
      positionX?: number;
      positionY?: number;
    }) => {
      const res = await fetch(api.garden.plantSeed.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to plant seed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garden.listSeeds.path] });
    }
  });
}

export function useUpdateSeed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: any;
    }) => {
      const url = api.garden.updateSeed.path.replace(':id', String(id));
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) throw new Error('Failed to update seed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garden.listSeeds.path] });
    }
  });
}

export function useGrowSeed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = api.garden.simulateGrowth.path.replace(':id', String(id));
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to grow seed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garden.listSeeds.path] });
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
    }
  });
}

export function useDeleteSeed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = api.garden.deleteSeed.path.replace(':id', String(id));
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to delete seed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garden.listSeeds.path] });
    }
  });
}

// Relationships hooks
export function useAgentRelationships(agentId?: number) {
  return useQuery({
    queryKey: [api.garden.listRelationships.path, agentId],
    queryFn: async () => {
      const url = agentId 
        ? `${api.garden.listRelationships.path}?agentId=${agentId}`
        : api.garden.listRelationships.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch relationships');
      return res.json();
    }
  });
}

export function useCreateRelationship() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      agentId: number;
      relatedAgentId: number;
      relationshipType: string;
      description?: string;
    }) => {
      const res = await fetch(api.garden.createRelationship.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to create relationship');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garden.listRelationships.path] });
    }
  });
}

// Autonomous actions hooks
export function useAutonomousActions(agentId?: number, actionType?: string, limit?: number) {
  return useQuery({
    queryKey: [api.garden.listActions.path, agentId, actionType, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (agentId) params.append('agentId', String(agentId));
      if (actionType) params.append('actionType', actionType);
      if (limit) params.append('limit', String(limit));
      
      const url = params.toString() 
        ? `${api.garden.listActions.path}?${params}` 
        : api.garden.listActions.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch actions');
      return res.json();
    }
  });
}

export function useTriggerAutonomy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agentId?: number) => {
      const res = await fetch(api.garden.triggerAutonomy.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agentId }),
      });
      
      if (!res.ok) throw new Error('Failed to trigger autonomy');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garden.listActions.path] });
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
    }
  });
}
