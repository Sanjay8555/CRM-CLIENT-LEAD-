
export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES'
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  FOLLOW_UP = 'FOLLOW_UP',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  scheduledAt: string;
  notes: string;
  completed: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: LeadStatus;
  priority: Priority;
  notes: string;
  assignedTo: string; // User ID
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
  aiScore?: number;
  aiInsights?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetId: string;
  targetType: 'LEAD' | 'USER' | 'TASK';
  timestamp: string;
}

export interface CRMState {
  user: User | null;
  leads: Lead[];
  users: User[];
  activities: ActivityLog[];
  followUps: FollowUp[];
}
