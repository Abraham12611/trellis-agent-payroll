import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Bell, Lock, User, Wallet } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input defaultValue="TechCorp AI Division" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="admin@techcorp.com" />
            </div>
            <div>
              <Label>Jurisdiction</Label>
              <Input defaultValue="United States" disabled />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Connected Wallet</Label>
              <Input value="0x1234...5678" disabled />
            </div>
            <div>
              <Label>Balance</Label>
              <Input value="150,000 PATHUSD" disabled />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Deposit</Button>
              <Button variant="outline" className="flex-1">Withdraw</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payroll Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified before payroll runs</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compliance Alerts</p>
                <p className="text-sm text-muted-foreground">Alerts for KYC and compliance issues</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task Updates</p>
                <p className="text-sm text-muted-foreground">Notifications for task marketplace</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Passkey Login</p>
                <p className="text-sm text-muted-foreground">Use biometric authentication</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div>
              <Button variant="destructive" className="w-full">Revoke All Sessions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
