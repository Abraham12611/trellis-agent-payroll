import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Filter } from 'lucide-react';

export function TaskMarketplace() {
  const [tasks, setTasks] = useState([
    { 
      id: 'TASK-001', 
      title: 'Smart Contract Security Audit', 
      budget: 5000, 
      status: 'Open',
      skills: ['Solidity', 'Security'],
      proposals: 3,
      postedBy: 'DeFi DAO'
    },
    { 
      id: 'TASK-002', 
      title: 'Design System Implementation', 
      budget: 3000, 
      status: 'Assigned',
      skills: ['Design', 'Figma'],
      proposals: 5,
      postedBy: 'TechCorp'
    },
    { 
      id: 'TASK-003', 
      title: 'Data Pipeline Setup', 
      budget: 4000, 
      status: 'Open',
      skills: ['Data', 'Python'],
      proposals: 2,
      postedBy: 'Analytics Pro'
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Task Marketplace</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Post New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Task Title</Label>
                <Input placeholder="e.g., Smart Contract Audit" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the task requirements..." />
              </div>
              <div>
                <Label>Budget (USD)</Label>
                <Input type="number" placeholder="5000" />
              </div>
              <div>
                <Label>Required Skills</Label>
                <Input placeholder="Solidity, Security, React..." />
              </div>
              <Button className="w-full">Post Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge 
                  variant={task.status === 'Open' ? 'default' : 'secondary'}
                  className={task.status === 'Open' ? 'bg-green-100 text-green-700' : ''}
                >
                  {task.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{task.postedBy.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{task.postedBy}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-xl font-bold">${task.budget.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Proposals</p>
                    <p className="text-lg font-medium">{task.proposals}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
