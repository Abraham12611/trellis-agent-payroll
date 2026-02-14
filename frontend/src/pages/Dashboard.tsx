import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Users, 
  Shield, 
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    { title: 'Total Balance', value: '$150,000', change: '+12%', icon: Wallet },
    { title: 'Active Agents', value: '12', change: '+2', icon: Users },
    { title: 'Compliance Rate', value: '100%', change: '0%', icon: Shield },
    { title: 'Next Payroll', value: '3 days', change: '$45,000', icon: Clock },
  ];

  const recentPayrolls = [
    { id: 'BATCH-001', date: '2025-02-01', amount: 45000, employees: 10, status: 'Completed' },
    { id: 'BATCH-002', date: '2025-01-01', amount: 42000, employees: 9, status: 'Completed' },
    { id: 'BATCH-003', date: '2024-12-01', amount: 40000, employees: 8, status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Run Payroll</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <stat.icon className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-green-600 flex items-center">
                  {stat.change}
                  <TrendingUp className="w-4 h-4 ml-1" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Payroll Progress */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Payroll Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">February Payroll Progress</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <Progress value={75} />
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-4">Recent Payrolls</h4>
                <div className="space-y-3">
                  {recentPayrolls.map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{payroll.id}</p>
                        <p className="text-sm text-muted-foreground">{payroll.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${payroll.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{payroll.employees} employees</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {payroll.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              Onboard New Agent
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              View Compliance
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Tax Reports
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Post Task
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
