import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

async function fetchUser(): Promise<User | null> {
  try {
    // Add timeout protection to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch("/api/auth/user", {
      credentials: "include",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      console.error("Auth fetch failed:", response.status, response.statusText);
      return null; // Return null instead of throwing to prevent loading state
    }

    return response.json();
  } catch (error) {
    // Handle timeout and network errors gracefully
    console.error("Auth fetch failed:", error);
    return null; // Return null instead of throwing
  }
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false, // Don't retry on failure
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    gcTime: 1000 * 60 * 10, // Cache for 10 minutes (formerly cacheTime)
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user: user ?? null, // Ensure we always return null instead of undefined
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
