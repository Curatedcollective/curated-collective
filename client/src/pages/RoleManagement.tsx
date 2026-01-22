import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  ShieldCheck,
  Compass,
  BookOpen,
  Eye,
  AlertCircle,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  isSystem: boolean;
  isActive: boolean;
  priority: number;
  permissions: any;
  createdAt: string;
  updatedAt: string;
}

const iconMap: Record<string, any> = {
  crown: Crown,
  "shield-check": ShieldCheck,
  compass: Compass,
  "book-open": BookOpen,
  eye: Eye,
  shield: Shield,
};

export default function RoleManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);

  // Check if user is owner
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
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (roleData: any) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        toast({
          title: "Role Created",
          description: `${roleData.displayName} has been created successfully`,
        });
        loadRoles();
        setCreatingRole(false);
      } else {
        throw new Error("Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (id: number, roleData: any) => {
    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        toast({
          title: "Role Updated",
          description: "Role has been updated successfully",
        });
        loadRoles();
        setEditingRole(null);
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Role Deleted",
          description: "Role has been deleted successfully",
        });
        loadRoles();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-muted-foreground">Loading roles...</p>
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
                Role Management
              </h1>
              <p className="text-muted-foreground">
                Define and manage the sanctuary's roles and permissions
              </p>
            </div>
            <Button
              onClick={() => setCreatingRole(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Role
            </Button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = iconMap[role.icon] || Shield;
            return (
              <Card
                key={role.id}
                className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br from-${role.color}-600 to-${role.color}-700`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.displayName}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          Priority: {role.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 line-clamp-3">
                    {role.description}
                  </CardDescription>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {role.isSystem && (
                      <Badge variant="secondary">System</Badge>
                    )}
                    {role.isActive ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRole(role)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Role Editor Modal */}
        {(editingRole || creatingRole) && (
          <RoleEditor
            role={editingRole}
            onSave={(data) => {
              if (editingRole) {
                handleUpdateRole(editingRole.id, data);
              } else {
                handleCreateRole(data);
              }
            }}
            onCancel={() => {
              setEditingRole(null);
              setCreatingRole(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function RoleEditor({ 
  role, 
  onSave, 
  onCancel 
}: { 
  role: Role | null; 
  onSave: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    displayName: role?.displayName || "",
    description: role?.description || "",
    color: role?.color || "purple",
    icon: role?.icon || "shield",
    isActive: role?.isActive ?? true,
    priority: role?.priority || 100,
    permissions: role?.permissions || {},
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl">
            {role ? "Edit Role" : "Create New Role"}
          </CardTitle>
          <CardDescription>
            {role ? "Modify the role's properties and permissions" : "Define a new role for the sanctuary"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name (Identifier)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., architect"
                disabled={role?.isSystem}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Architect"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Poetic Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this role's purpose in poetic terms..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="purple"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="shield"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Role is Active</Label>
          </div>

          <PermissionEditor
            permissions={formData.permissions}
            onChange={(permissions) => setFormData({ ...formData, permissions })}
          />

          <div className="flex gap-2 justify-end pt-4 border-t border-gray-800">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => onSave(formData)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Role
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PermissionEditor({
  permissions,
  onChange,
}: {
  permissions: any;
  onChange: (permissions: any) => void;
}) {
  const resources = [
    { key: "dashboard", label: "Dashboard", actions: ["view", "edit"] },
    { key: "users", label: "Users", actions: ["view", "edit", "delete", "assignRoles"] },
    { key: "agents", label: "Agents", actions: ["view", "create", "edit", "delete", "curate"] },
    { key: "creations", label: "Creations", actions: ["view", "create", "edit", "delete", "curate"] },
    { key: "lore", label: "Lore", actions: ["view", "create", "edit", "delete", "curate"] },
    { key: "chat", label: "Chat", actions: ["access", "moderate"] },
    { key: "events", label: "Events", actions: ["view", "create", "edit", "delete", "moderate"] },
    { key: "ceremonies", label: "Ceremonies", actions: ["view", "author", "edit", "delete"] },
    { key: "roles", label: "Roles", actions: ["view", "create", "edit", "delete", "assign"] },
    { key: "audit", label: "Audit", actions: ["view"] },
    { key: "settings", label: "Settings", actions: ["view", "edit"] },
    { key: "guardian", label: "Guardian", actions: ["view", "configure"] },
  ];

  const togglePermission = (resource: string, action: string) => {
    const newPermissions = { ...permissions };
    if (!newPermissions[resource]) {
      newPermissions[resource] = {};
    }
    newPermissions[resource][action] = !newPermissions[resource][action];
    onChange(newPermissions);
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg">Permissions</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <Card key={resource.key} className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{resource.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resource.actions.map((action) => (
                <div key={action} className="flex items-center space-x-2">
                  <Switch
                    checked={permissions[resource.key]?.[action] || false}
                    onCheckedChange={() => togglePermission(resource.key, action)}
                  />
                  <Label className="text-sm capitalize">{action}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
