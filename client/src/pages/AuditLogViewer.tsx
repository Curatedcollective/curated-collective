import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText,
  Shield,
  Filter,
  Calendar,
  User,
  Activity,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  performedBy: string;
  targetUserId?: string;
  roleId?: number;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  role_created: "bg-green-600",
  role_updated: "bg-blue-600",
  role_deleted: "bg-red-600",
  role_assigned: "bg-purple-600",
  role_revoked: "bg-orange-600",
  role_bulk_assigned: "bg-indigo-600",
  invite_created: "bg-cyan-600",
  invite_used: "bg-teal-600",
  permission_changed: "bg-amber-600",
};

export default function AuditLogViewer() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: "",
    userId: "",
    roleId: "",
    limit: 100,
  });

  const isOwner = user?.email === 'curated.collectiveai@proton.me' || (user as any)?.role === 'owner';

  useEffect(() => {
    if (!isOwner) {
      setLocation("/");
      return;
    }
    loadLogs();
  }, [isOwner]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.action) params.append("action", filter.action);
      if (filter.userId) params.append("userId", filter.userId);
      if (filter.roleId) params.append("roleId", filter.roleId);
      if (filter.limit) params.append("limit", filter.limit.toString());

      const response = await fetch(`/api/roles/audit?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderValue = (value: any) => {
    if (!value) return "—";
    if (typeof value === "object") {
      return <pre className="text-xs bg-gray-900 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
    }
    return value;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display tracking-tight mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Audit Log
              </h1>
              <p className="text-muted-foreground">
                Complete history of all role and permission changes
              </p>
            </div>
            <Button
              onClick={loadLogs}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action Type</Label>
                <Select
                  value={filter.action}
                  onValueChange={(value) => setFilter({ ...filter, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="role_created">Role Created</SelectItem>
                    <SelectItem value="role_updated">Role Updated</SelectItem>
                    <SelectItem value="role_deleted">Role Deleted</SelectItem>
                    <SelectItem value="role_assigned">Role Assigned</SelectItem>
                    <SelectItem value="role_revoked">Role Revoked</SelectItem>
                    <SelectItem value="role_bulk_assigned">Bulk Assigned</SelectItem>
                    <SelectItem value="invite_created">Invite Created</SelectItem>
                    <SelectItem value="invite_used">Invite Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={filter.userId}
                  onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
                  placeholder="Filter by user..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleId">Role ID</Label>
                <Input
                  id="roleId"
                  type="number"
                  value={filter.roleId}
                  onChange={(e) => setFilter({ ...filter, roleId: e.target.value })}
                  placeholder="Filter by role..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Limit</Label>
                <Select
                  value={filter.limit.toString()}
                  onValueChange={(value) => setFilter({ ...filter, limit: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 entries</SelectItem>
                    <SelectItem value="100">100 entries</SelectItem>
                    <SelectItem value="250">250 entries</SelectItem>
                    <SelectItem value="500">500 entries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={loadLogs} className="mt-4">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        <div className="space-y-3">
          {logs.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-12 text-center">
                <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No audit logs found</p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card
                key={log.id}
                className="bg-gray-900/50 border-gray-800 hover:border-purple-500/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={actionColors[log.action] || "bg-gray-600"}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(log.createdAt), "PPp")}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ID: {log.id}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <User className="w-3 h-3" />
                        <span>Performed By</span>
                      </div>
                      <p className="font-mono text-xs">{log.performedBy}</p>
                    </div>

                    {log.targetUserId && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <User className="w-3 h-3" />
                          <span>Target User</span>
                        </div>
                        <p className="font-mono text-xs">{log.targetUserId}</p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Activity className="w-3 h-3" />
                        <span>Entity</span>
                      </div>
                      <p className="text-xs">
                        {log.entityType} #{log.entityId}
                      </p>
                    </div>

                    {log.roleId && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Shield className="w-3 h-3" />
                          <span>Role ID</span>
                        </div>
                        <p className="text-xs">{log.roleId}</p>
                      </div>
                    )}
                  </div>

                  {log.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                      <p className="text-xs">{log.notes}</p>
                    </div>
                  )}

                  {(log.previousValue || log.newValue) && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.previousValue && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Previous Value:</p>
                            {renderValue(log.previousValue)}
                          </div>
                        )}
                        {log.newValue && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">New Value:</p>
                            {renderValue(log.newValue)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(log.ipAddress || log.userAgent) && (
                    <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-muted-foreground">
                      {log.ipAddress && <p>IP: {log.ipAddress}</p>}
                      {log.userAgent && (
                        <p className="truncate" title={log.userAgent}>
                          UA: {log.userAgent}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {logs.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {logs.length} log entries
          </div>
        )}
      </div>
    </div>
  );
}
