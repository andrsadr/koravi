export interface Client {
  id: string;
  client_id?: number;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  occupation?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  status: 'active' | 'inactive' | 'archived';
  labels: string[];
  notes?: string | null;
  alerts?: string | null;
  last_visit?: string | null;
  total_visits: number;
  lifetime_value: number;
}

export type ClientFormData = Omit<Client, 'id' | 'client_id' | 'created_at' | 'updated_at'>;

export interface SearchResult {
  id: string;
  type: 'client';
  title: string;
  subtitle: string;
  href: string;
}