import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search } from 'lucide-react';

export function AgentOnboarding() {
  const [agents, setAgents] = useState([
    { id: 'AGENT-001', name: 'CodePilot-AI', type: 'AI_AGENT', status: 'Active', jurisdiction: 'US', wallet: '0x1234...5678' },
    { id: 'AGENT-002', name: 'Sarah Chen', type: 'HUMAN', status: 'Active', jurisdiction: 'US', wallet: '0xabcd...efgh' },
    { id: 'AGENT-003', name: 'DataMiner-Pro', type: 'AI_AGENT', status: 'Pending', jurisdiction: 'UK', wallet: '0x9876...5432' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Onboard Agent
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="human">Human</TabsTrigger>
          <TabsTrigger value="ai">AI Agents</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search agents..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={agent.type === 'AI_AGENT' ? 'secondary' : 'default'}>
                        {agent.type === 'AI_AGENT' ? 'AI Agent' : 'Human'}
                      </Badge>
                      <Badge variant="outline">{agent.jurisdiction}</Badge>
                      <span className="text-sm text-muted-foreground font-mono">
                        {agent.wallet}
                      </span>
                      <Badge 
                        variant={agent.status === 'Active' ? 'default' : 'secondary'}
                        className={agent.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
