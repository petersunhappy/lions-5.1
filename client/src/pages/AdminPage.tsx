import React from 'react';
import Admin from '@/components/Admin';
import LiveStream from '@/components/LiveStream';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

/**
 * Admin Page Component
 * Features:
 * - Tabbed interface for different admin functions
 * - Athlete and event management
 * - Live stream management
 * - Role-based access control
 */
export default function AdminPage() {
  const { isAdmin } = useApp();

  if (!isAdmin) {
    return <Admin />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-page">
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" data-testid="tab-management">
            Gerenciamento
          </TabsTrigger>
          <TabsTrigger value="streams" data-testid="tab-streams">
            Transmissões
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="management" className="mt-6">
          <Admin />
        </TabsContent>
        
        <TabsContent value="streams" className="mt-6">
          <LiveStream />
        </TabsContent>
      </Tabs>
    </div>
  );
}
