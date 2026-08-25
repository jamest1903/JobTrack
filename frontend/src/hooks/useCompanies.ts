import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '@/api/companies';
import type { CreateCompanyParams, UpdateCompanyParams } from '@/api/companies';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateCompanyParams) => createCompany(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & UpdateCompanyParams) =>
      updateCompany(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
