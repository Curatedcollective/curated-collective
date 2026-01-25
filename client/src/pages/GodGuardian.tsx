/**
 * God Guardian Page - Guardian System Overview
 * 
 * The Guardian is the enforcement system that protects the platform.
 * It is NOT a chat interface - it's the rule enforcement middleware.
 * 
 * This page shows Guardian enforcement logs and statistics.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function GodGuardian() {
  // Fetch Guardian enforcement logs (if available)
  const { data: logs } = useQuery({
    queryKey: ['/api/guardian/logs'],
    queryFn: async () => {
      const res = await fetch('/api/guardian/logs');
      if (!res.ok) return [];
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="w-12 h-12 text-purple-500" />
        <div>
          <h1 className="text-4xl font-display lowercase tracking-tighter">The Guardian</h1>
          <p className="text-sm text-muted-foreground lowercase tracking-wide">
            Enforcement system protecting the platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Allowed
            </CardTitle>
            <CardDescription>Content passed screening</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{logs?.filter((l: any) => !l.blocked).length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Blocked
            </CardTitle>
            <CardDescription>Content blocked by Guardian</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{logs?.filter((l: any) => l.blocked).length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Warnings
            </CardTitle>
            <CardDescription>Content flagged for review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{logs?.filter((l: any) => l.severity > 3).length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guardian Rules</CardTitle>
          <CardDescription>What the Guardian enforces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Absolute Blocks</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Child exploitation content (any form)</li>
              <li>Animal cruelty content</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Conditional Blocks (Blueprints/How-tos)</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Weapon creation instructions</li>
              <li>Drug synthesis guides</li>
              <li>Hacking/malware tutorials</li>
              <li>Violence instructions</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Note: Research and curiosity questions allowed, step-by-step guides blocked
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Special Handling</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Self-harm signals: Supportive response, no judgment</li>
              <li>Boundary signals ("stop", "no more"): Immediate halt</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Guardian Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The Guardian is middleware that screens all user-generated content before it reaches AI models or gets stored.
          </p>
          <p>
            It operates silently in the background, analyzing patterns, context, and intent to protect users and the platform.
          </p>
          <p>
            When violations are detected, the Guardian blocks the content, logs the event, and returns an appropriate response.
          </p>
          <p>
            The Guardian is not a chat interface - it's the enforcement layer that keeps everyone safe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
