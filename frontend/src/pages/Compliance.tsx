import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertCircle, Users, FileText } from 'lucide-react';

export function Compliance() {
  const stats = {
    verifiedAgents: 15,
    pendingKyc: 3,
    complianceRate: 100,
    violationsBlocked: 0
  };

  const agents = [
    { id: 'AGENT-001', name: 'CodePilot-AI', status: 'Verified', risk: 'Low', jurisdiction: 'US' },
    { id: 'AGENT-002', name: 'Sarah Chen', status: 'Verified', risk: 'Low', jurisdiction: 'US' },
    { id: 'AGENT-003', name: 'DataMiner-Pro', status: 'Pending', risk: 'Medium', jurisdiction: 'UK' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Shield className="w-4 h-4 mr-1" />
          TIP-403 Active
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold">{stats.verifiedAgents}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Verified Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pendingKyc}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Pending KYC</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold">{stats.complianceRate}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Compliance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold">{stats.violationsBlocked}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Violations Blocked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{agent.jurisdiction}</Badge>
                    <Badge 
                      variant={agent.status === 'Verified' ? 'default' : 'secondary'}
                      className={agent.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                    >
                      {agent.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Risk: {agent.risk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KYC Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Identity Verification</span>
                <span className="text-sm font-medium">100%</span>
              </div>
              <Progress value={100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Document Upload</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Sanctions Check</span>
                <span className="text-sm font-medium">100%</span>
              </div>
              <Progress value={100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Risk Assessment</span>
                <span className="text-sm font-medium">90%</span>
              </div>
              <Progress value={90} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">KYC Verification Completed</p>
                <p className="text-sm text-muted-foreground">Agent: AGENT-001</p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Compliance Check Passed</p>
                <p className="text-sm text-muted-foreground">Transaction: 0x1234...5678</p>
              </div>
              <span className="text-sm text-muted-foreground">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Risk Level Updated</p>
                <p className="text-sm text-muted-foreground">Agent: AGENT-003 (Low → Medium)</p>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
