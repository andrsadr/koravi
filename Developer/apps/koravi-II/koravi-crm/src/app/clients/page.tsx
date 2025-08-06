import { ClientList } from '@/components/clients/ClientList';

export default function ClientsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass-card rounded-2xl p-6">
        <ClientList />
      </div>
    </div>
  );
}