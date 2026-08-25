import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { CompaniesSkeleton } from '@/components/companies/CompaniesSkeleton';
import { CompanyDialog } from '@/components/companies/CompanyDialog';
import { DeleteCompanyDialog } from '@/components/companies/DeleteCompanyDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import type { Company } from '@/types';

export function CompaniesPage() {
  const companiesQuery = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    const list = companiesQuery.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q),
    );
  }, [companiesQuery.data, search]);

  function handleEdit(company: Company) {
    setEditingCompany(company);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditingCompany(undefined);
  }

  if (companiesQuery.isLoading) {
    return <CompaniesSkeleton />;
  }

  if (companiesQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load companies"
        error={companiesQuery.error}
        onRetry={() => companiesQuery.refetch()}
      />
    );
  }

  const companies = companiesQuery.data!;

  if (companies.length === 0) {
    return (
      <EmptyState
        title="No companies yet"
        description="Add companies you're interested in to keep track of them in one place."
      >
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add company
        </button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            {companies.length} {companies.length === 1 ? 'company' : 'companies'}
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add company</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Search companies"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No companies match your search.
          </p>
        </div>
      ) : (
        <CompaniesTable
          companies={filtered}
          onEdit={handleEdit}
          onDelete={setDeletingCompany}
        />
      )}

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        company={editingCompany}
        onSubmit={
          editingCompany
            ? (data) => updateCompany.mutateAsync({ id: editingCompany.id, ...data })
            : (data) => createCompany.mutateAsync(data as import('@/api/companies').CreateCompanyParams)
        }
      />

      <DeleteCompanyDialog
        open={!!deletingCompany}
        onOpenChange={(open) => {
          if (!open) setDeletingCompany(null);
        }}
        company={deletingCompany}
        onConfirm={(id) => deleteCompany.mutateAsync(id)}
      />
    </div>
  );
}
