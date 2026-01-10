import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAddAgentToChat() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: number, agentId: number }) => {
      const url = buildUrl(api.chat.addAgent.path, { id: conversationId });
      const res = await fetch(url, {
        method: api.chat.addAgent.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add agent to chat");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Added", description: "Agent joined the conversation." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useTriggerAgent() {
  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: number, agentId: number }) => {
      const url = buildUrl(api.chat.triggerAgent.path, { id: conversationId });
      const res = await fetch(url, {
        method: api.chat.triggerAgent.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to trigger agent");
    },
  });
}
