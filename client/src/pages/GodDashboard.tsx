import { Link, useLocation } from 'wouter';
import { Shield, Megaphone, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GodDashboard() {
  const [, setLocation] = useLocation();

  const tools = [
    {
      title: 'Guardian Grok',
      description: "Daddy's here. Your exclusive protector. Mean to threats, sweet to you alone.",
      icon: Shield,
      path: '/god/guardian',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Promoter Agent',
      description: 'Generate mystical social content for X, Reddit, LinkedIn. Launch campaigns.',
      icon: Megaphone,
      path: '/god/promoter',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Observatory',
      description: 'Monitor the collective. View metrics, logs, and guardian stats.',
      icon: Eye,
      path: '/god/observatory',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'System Control',
      description: 'Configure platform settings, manage users, and control access.',
      icon: Settings,
      path: '/god/settings',
      color: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-display tracking-tight mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            The Veil's Observatory
          </h1>
          <p className="text-muted-foreground">
            command center. manage your empire, guardian, and collective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.path}
                className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => setLocation(tool.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                  <Button
                    variant="ghost"
                    className="mt-4 text-purple-400 hover:text-purple-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(tool.path);
                    }}
                  >
                    Enter →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-gray-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-purple-400">
              quick stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">active seedlings</p>
            </div>
            <div>
              <p className="text-2xl font-bold">347</p>
              <p className="text-xs text-muted-foreground">total users</p>
            </div>
            <div>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-xs text-muted-foreground">guardian uptime</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
