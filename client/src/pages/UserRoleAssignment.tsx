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
import { Textarea } from "@/components/ui/textarea";
import { 
  UserPlus, 
  Users,
  Search,
  Shield,
  X,
  Check,
  Mail,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  priority: number;
}

interface UserRole {
  id: number;
  userId: string;
  roleId: number;
  assignedBy: string;
  assignedAt: string;
  context?: string;
  isActive: boolean;
  role: Role;
}

// Map color names to actual Tailwind classes (for proper CSS generation)
const colorMap: Record<string, string> = {
  purple: "bg-purple-600",
  emerald: "bg-emerald-600",
  blue: "bg-blue-600",
  amber: "bg-amber-600",
  gray: "bg-gray-600",
  red: "bg-red-600",
  green: "bg-green-600",
  indigo: "bg-indigo-600",
  pink: "bg-pink-600",
  cyan: "bg-cyan-600",
  teal: "bg-teal-600",
  orange: "bg-orange-600",
};

export default function UserRoleAssignment() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [userIds, setUserIds] = useState("");
  const [context, setContext] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<number | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteMaxUses, setInviteMaxUses] = useState(1);
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);

  const isOwner = user?.email === 'curated.collectiveai@proton.me' || (user as any)?.role === 'owner';

  useEffect(() => {
    if (!isOwner) {
      setLocation("/");
      return;
    }
    loadRoles();
  }, [isOwner]);

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRole || !userIds.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a role and enter at least one user ID",
        variant: "destructive",
      });
      return;
    }

    const ids = userIds.split(/[\n,]/).map(id => id.trim()).filter(id => id);

    try {
      const response = await fetch("/api/roles/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: ids,
          roleId: selectedRole,
          assignedBy: (user as any).id,
          context: context.trim() || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Roles Assigned",
          description: `Successfully assigned role to ${result.count} user(s)`,
        });
        setUserIds("");
        setContext("");
        setSelectedRole(null);
      } else {
        throw new Error("Failed to assign roles");
      }
    } catch (error) {
      console.error("Error assigning roles:", error);
      toast({
        title: "Error",
        description: "Failed to assign roles",
        variant: "destructive",
      });
    }
  };

  const handleSearchUserRoles = async () => {
    if (!searchUserId.trim()) return;

    try {
      const response = await fetch(`/api/roles/user/${searchUserId.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setUserRoles(data);
      } else {
        toast({
          title: "User Not Found",
          description: "Could not find roles for this user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching user roles:", error);
      toast({
        title: "Error",
        description: "Failed to search user roles",
        variant: "destructive",
      });
    }
  };

  const handleRevokeRole = async (userId: string, roleId: number) => {
    if (!confirm("Are you sure you want to revoke this role?")) return;

    try {
      const response = await fetch("/api/roles/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId }),
      });

      if (response.ok) {
        toast({
          title: "Role Revoked",
          description: "Role has been revoked successfully",
        });
        handleSearchUserRoles();
      }
    } catch (error) {
      console.error("Error revoking role:", error);
      toast({
        title: "Error",
        description: "Failed to revoke role",
        variant: "destructive",
      });
    }
  };

  const handleCreateInvite = async () => {
    if (!inviteRoleId) {
      toast({
        title: "Missing Role",
        description: "Please select a role for the invite",
        variant: "destructive",
      });
      return;
    }

    // Generate cryptographically secure invite code
    const generateInviteCode = () => {
      // Use crypto for secure random string
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `invite-${crypto.randomUUID()}`;
      } else {
        // Fallback for environments without crypto.randomUUID
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return `invite-${Array.from(array, b => b.toString(16).padStart(2, '0')).join('')}`;
      }
    };

    const inviteCode = generateInviteCode();

    try {
      const response = await fetch("/api/roles/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inviteCode,
          email: inviteEmail.trim() || null,
          roleId: inviteRoleId,
          maxUses: inviteMaxUses,
          isActive: true,
          createdBy: (user as any).id,
          message: inviteMessage.trim() || null,
          expiresAt: null, // Could add expiration logic
        }),
      });

      if (response.ok) {
        const invite = await response.json();
        setGeneratedInvite(invite);
        toast({
          title: "Invite Created",
          description: "Role invite has been generated successfully",
        });
        // Reset form
        setInviteEmail("");
        setInviteMessage("");
        setInviteMaxUses(1);
      } else {
        throw new Error("Failed to create invite");
      }
    } catch (error) {
      console.error("Error creating invite:", error);
      toast({
        title: "Error",
        description: "Failed to create invite",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Shield className="w-12 h-12 animate-pulse text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display tracking-tight mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            User Role Assignment
          </h1>
          <p className="text-muted-foreground">
            Grant roles to users and manage their permissions
          </p>
        </div>

        <Tabs defaultValue="assign" className="space-y-6">
          <TabsList className="bg-gray-900/50">
            <TabsTrigger value="assign">Assign Roles</TabsTrigger>
            <TabsTrigger value="search">Search Users</TabsTrigger>
            <TabsTrigger value="invite">Create Invites</TabsTrigger>
          </TabsList>

          {/* Assign Roles Tab */}
          <TabsContent value="assign">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Bulk Role Assignment</CardTitle>
                <CardDescription>
                  Assign a role to one or multiple users at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select
                    value={selectedRole?.toString() || ""}
                    onValueChange={(value) => setSelectedRole(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.displayName} (Priority: {role.priority})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userIds">User IDs</Label>
                  <Textarea
                    id="userIds"
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                    placeholder="Enter user IDs, one per line or comma-separated..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter multiple user IDs separated by commas or new lines
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Context (Optional)</Label>
                  <Input
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Reason for assignment..."
                  />
                </div>

                <Button
                  onClick={handleAssignRole}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Role
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Users Tab */}
          <TabsContent value="search">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Search User Roles</CardTitle>
                <CardDescription>
                  View and manage roles for a specific user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    placeholder="Enter user ID..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUserRoles()}
                  />
                  <Button onClick={handleSearchUserRoles}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {userRoles.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      User Roles ({userRoles.length})
                    </h3>
                    {userRoles.map((userRole) => (
                      <Card key={userRole.id} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={colorMap[userRole.role.color] || colorMap.gray}>
                                  {userRole.role.displayName}
                                </Badge>
                                {userRole.isActive ? (
                                  <Badge variant="default" className="bg-green-600">
                                    <Check className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <X className="w-3 h-3 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Assigned: {new Date(userRole.assignedAt).toLocaleDateString()}
                              </p>
                              {userRole.context && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Context: {userRole.context}
                                </p>
                              )}
                            </div>
                            {userRole.isActive && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevokeRole(userRole.userId, userRole.roleId)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {searchUserId && userRoles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No roles found for this user</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Invites Tab */}
          <TabsContent value="invite">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Create Role Invite</CardTitle>
                <CardDescription>
                  Generate an invite link for onboarding with a specific role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select
                    value={inviteRoleId?.toString() || ""}
                    onValueChange={(value) => setInviteRoleId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email (Optional)</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for an open invite
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteMaxUses">Max Uses</Label>
                  <Input
                    id="inviteMaxUses"
                    type="number"
                    min="1"
                    value={inviteMaxUses}
                    onChange={(e) => setInviteMaxUses(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteMessage">Welcome Message</Label>
                  <Textarea
                    id="inviteMessage"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="A poetic welcome message..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreateInvite}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Invite
                </Button>

                {generatedInvite && (
                  <Card className="bg-green-900/20 border-green-600/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <LinkIcon className="w-4 h-4 mt-1 text-green-400" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-400 mb-1">
                            Invite Created Successfully!
                          </p>
                          <p className="text-xs text-muted-foreground break-all">
                            Code: {generatedInvite.code}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedInvite.code);
                          toast({
                            title: "Copied!",
                            description: "Invite code copied to clipboard",
                          });
                        }}
                      >
                        Copy Invite Code
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
