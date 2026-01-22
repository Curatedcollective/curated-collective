import { ReactNode } from "react";
import { usePermissions, Permissions } from "@/hooks/use-permissions";

interface ProtectedProps {
  children: ReactNode;
  resource: keyof Permissions;
  action: string;
  fallback?: ReactNode;
  requireAll?: Array<{ resource: keyof Permissions; action: string }>;
  requireAny?: Array<{ resource: keyof Permissions; action: string }>;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * Usage:
 * <Protected resource="roles" action="create">
 *   <Button>Create Role</Button>
 * </Protected>
 * 
 * Or with multiple permission checks:
 * <Protected requireAny={[
 *   { resource: "roles", action: "create" },
 *   { resource: "roles", action: "edit" }
 * ]}>
 *   <Button>Manage Roles</Button>
 * </Protected>
 */
export function Protected({ 
  children, 
  resource, 
  action, 
  fallback = null,
  requireAll,
  requireAny 
}: ProtectedProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions();

  // While loading, don't render anything (prevents flash of unauthorized content)
  if (loading) {
    return null;
  }

  let hasAccess = false;

  if (requireAll) {
    hasAccess = hasAllPermissions(requireAll);
  } else if (requireAny) {
    hasAccess = hasAnyPermission(requireAny);
  } else if (resource && action) {
    hasAccess = hasPermission(resource, action);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook-based alternative for conditional logic
 * 
 * Usage:
 * const canCreate = useHasPermission("roles", "create");
 * 
 * if (canCreate) {
 *   // do something
 * }
 */
export function useHasPermission(resource: keyof Permissions, action: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(resource, action);
}

/**
 * Higher-order component for protecting entire pages
 * 
 * Usage:
 * export default withPermission(MyPage, { resource: "dashboard", action: "view" });
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: { resource: keyof Permissions; action: string },
  fallback?: ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <Protected 
        resource={permission.resource} 
        action={permission.action}
        fallback={fallback || <UnauthorizedPage />}
      >
        <Component {...props} />
      </Protected>
    );
  };
}

/**
 * Default unauthorized page component
 */
function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-purple-400 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-display tracking-tight mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to access this area of the sanctuary.
        </p>
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact the sanctuary's keeper.
        </p>
      </div>
    </div>
  );
}
