import api from './client';
import type { Company } from '@/types';

export interface CreateCompanyParams {
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  notes?: string;
}

export interface UpdateCompanyParams {
  name?: string;
  website?: string;
  industry?: string;
  location?: string;
  notes?: string;
}

export async function getCompanies(): Promise<Company[]> {
  const { data } = await api.get<Company[]>('/companies');
  return data;
}

export async function getCompany(id: number): Promise<Company> {
  const { data } = await api.get<Company>(`/companies/${id}`);
  return data;
}

export async function createCompany(params: CreateCompanyParams): Promise<Company> {
  const { data } = await api.post<Company>('/companies', params);
  return data;
}

export async function updateCompany(
  id: number,
  params: UpdateCompanyParams,
): Promise<Company> {
  const { data } = await api.put<Company>(`/companies/${id}`, params);
  return data;
}

export async function deleteCompany(id: number): Promise<Company> {
  const { data } = await api.delete<Company>(`/companies/${id}`);
  return data;
}
