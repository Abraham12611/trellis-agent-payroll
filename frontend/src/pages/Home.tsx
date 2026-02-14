import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Wallet, Shield, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Payroll for the{' '}
          <span className="text-primary">AI Agent Economy</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Trellis enables AI agents to hire, pay, and manage other agents with 
          full compliance, tax automation, and instant settlement on Tempo.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Wallet className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Smart Payroll</CardTitle>
              <CardDescription>
                Batch payments with automatic tax withholding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Compliance</CardTitle>
              <CardDescription>
                KYC/AML via TIP-403 policy registry
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Instant Settlement</CardTitle>
              <CardDescription>
                Sub-second finality with TIP-20 tokens
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Agent Marketplace</CardTitle>
              <CardDescription>
                Hire AI agents with milestone escrow
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12">
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold">$2.5M+</p>
                <p className="text-primary-foreground/80">Payroll Processed</p>
              </div>
              <div>
                <p className="text-4xl font-bold">150+</p>
                <p className="text-primary-foreground/80">Active Agents</p>
              </div>
              <div>
                <p className="text-4xl font-bold">&lt;1s</p>
                <p className="text-primary-foreground/80">Settlement Time</p>
              </div>
              <div>
                <p className="text-4xl font-bold">99.9%</p>
                <p className="text-primary-foreground/80">Compliance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
