import ConnectionStatus from '@/components/ui/ConnectionStatus';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Welcome to Koravi CRM - your modern client management system
        </p>
        
        {/* Database Connection Status */}
        <div className="mb-8 flex justify-center">
          <ConnectionStatus />
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Quick Actions
          </h2>
          <p className="text-muted-foreground mb-6">
            Get started with your client management
          </p>
          <div className="space-y-4">
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-3 text-center transition-colors">
              View All Clients
            </button>
            <button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg p-3 text-center transition-colors">
              Add New Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}