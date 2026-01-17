import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { User } from "@shared/models/auth";

const AUTH_FETCH_TIMEOUT_MS = 2000; // 2 seconds
const AUTH_MAX_LOADING_MS = 2500; // 2.5 seconds - emergency fallback
const AUTH_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const AUTH_CACHE_TIME_MS = 10 * 60 * 1000; // 10 minutes

async function fetchUser(): Promise<User | null> {
  try {
    // Add timeout protection to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
    
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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasForceResolved = useRef(false);
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false, // Don't retry on failure
    staleTime: AUTH_STALE_TIME_MS,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    gcTime: AUTH_CACHE_TIME_MS,
    initialData: null, // Start with null immediately
  });

  // Emergency fallback: if loading takes more than 2.5 seconds, force resolve to null
  useEffect(() => {
    if (isLoading && !hasForceResolved.current) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("Auth loading timeout exceeded, forcing resolution to unauthenticated state");
        hasForceResolved.current = true;
        queryClient.setQueryData(["/api/auth/user"], null);
      }, AUTH_MAX_LOADING_MS);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, queryClient]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user: user ?? null, // Ensure we always return null instead of undefined
    isLoading: isLoading && !hasForceResolved.current, // Override isLoading after force resolve
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
