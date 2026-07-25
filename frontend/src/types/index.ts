export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Company {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  title: string;
  location?: string;
  salary?: number;
  workType?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  source?: string;
  url?: string;
  description?: string;
  status: 'SAVED' | 'APPLYING' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  dateFound: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
}

export interface Application {
  id: number;
  status: 'SAVED' | 'APPLYING' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  appliedDate?: string;
  cvVersion?: string;
  coverLetter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  job: Job;
}

export interface DashboardStats {
  totalApplications: number;
  byStatus: {
    saved: number;
    applying: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  responseRate: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
