export default function ClientsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          Clients
        </h1>
        <p className="text-xl text-white/80">
          Manage your client relationships
        </p>
      </div>
      
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Client Management
        </h2>
        <p className="text-white/70 mb-6">
          This is where your client list and management tools will be implemented.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="glass-button rounded-lg p-4 text-center">
            <h3 className="text-white font-medium mb-2">Search Clients</h3>
            <p className="text-white/60 text-sm">Find clients quickly</p>
          </div>
          <div className="glass-button rounded-lg p-4 text-center">
            <h3 className="text-white font-medium mb-2">Add Client</h3>
            <p className="text-white/60 text-sm">Create new client profile</p>
          </div>
          <div className="glass-button rounded-lg p-4 text-center">
            <h3 className="text-white font-medium mb-2">Client Reports</h3>
            <p className="text-white/60 text-sm">View client analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}