import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
import { AgentOnboarding } from '@/pages/AgentOnboarding';
import { Payroll } from '@/pages/Payroll';
import { Compliance } from '@/pages/Compliance';
import { TaskMarketplace } from '@/pages/TaskMarketplace';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents/onboard" element={<AgentOnboarding />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/tasks" element={<TaskMarketplace />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
