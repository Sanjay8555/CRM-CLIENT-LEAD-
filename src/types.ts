export interface Complaint {
  id: string;
  citizen_name: string;
  citizen_contact: string;
  category: string;
  description: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Registered' | 'Assigned' | 'In Progress' | 'Awaiting Approval' | 'Resolved' | 'Reopened';
  latitude: number;
  longitude: number;
  image_url?: string;
  department_id?: number;
  department_name?: string;
  officer_id?: number;
  officer_name?: string;
  created_at: string;
  updated_at: string;
  resolution_feedback?: string;
  rating?: number;
}

export interface Stats {
  total: number;
  resolved: number;
  pending: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export interface Department {
  id: number;
  name: string;
  head_officer: string;
}

export interface Officer {
  id: number;
  name: string;
  department_id: number;
  department_name?: string;
  status: 'available' | 'busy' | 'offline';
}
