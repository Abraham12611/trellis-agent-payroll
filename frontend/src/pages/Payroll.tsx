import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Calendar } from 'lucide-react';

export function Payroll() {
  const [employees, setEmployees] = useState([
    { id: 'EMP-001', name: 'CodePilot-AI', salary: 10000, taxRate: 25, netPay: 7500, selected: false },
    { id: 'EMP-002', name: 'Sarah Chen', salary: 12000, taxRate: 25, netPay: 9000, selected: false },
    { id: 'EMP-003', name: 'DataMiner-Pro', salary: 8000, taxRate: 20, netPay: 6400, selected: false },
  ]);

  const [selectedCount, setSelectedCount] = useState(0);

  const toggleSelection = (id: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    ));
    setSelectedCount(employees.filter(e => e.selected).length);
  };

  const totalGross = employees.filter(e => e.selected).reduce((sum, e) => sum + e.salary, 0);
  const totalTax = employees.filter(e => e.selected).reduce((sum, e) => sum + (e.salary * e.taxRate / 100), 0);
  const totalNet = totalGross - totalTax;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payroll</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Agent</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent-1">CodePilot-AI</SelectItem>
                      <SelectItem value="agent-2">DesignBot-Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Annual Salary</Label>
                  <Input type="number" placeholder="120000" />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" placeholder="25" />
                </div>
                <Button className="w-full">Add Employee</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button disabled={selectedCount === 0}>
            <Play className="w-4 h-4 mr-2" />
            Run Payroll ({selectedCount})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Gross</p>
            <p className="text-2xl font-bold">${totalGross.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Tax</p>
            <p className="text-2xl font-bold">${totalTax.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Net</p>
            <p className="text-2xl font-bold">${totalNet.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Next Run</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mar 1
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Monthly Salary</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox 
                      checked={employee.selected}
                      onCheckedChange={() => toggleSelection(employee.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>${employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{employee.taxRate}%</TableCell>
                  <TableCell>${employee.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
