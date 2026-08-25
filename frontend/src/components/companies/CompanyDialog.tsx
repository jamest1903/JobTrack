import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';
import type { CreateCompanyParams, UpdateCompanyParams } from '@/api/companies';

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onSubmit: (data: CreateCompanyParams | UpdateCompanyParams) => Promise<unknown>;
  error?: string | null;
}

const initialForm: CreateCompanyParams = {
  name: '',
  website: '',
  industry: '',
  location: '',
  notes: '',
};

export function CompanyDialog({
  open,
  onOpenChange,
  company,
  onSubmit,
  error,
}: CompanyDialogProps) {
  const [form, setForm] = useState<CreateCompanyParams>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = !!company;

  useEffect(() => {
    if (open) {
      if (company) {
        setForm({
          name: company.name,
          website: company.website ?? '',
          industry: company.industry ?? '',
          location: company.location ?? '',
          notes: company.notes ?? '',
        });
      } else {
        setForm(initialForm);
      }
      setSubmitError(null);
    }
  }, [open, company]);

  function update(field: keyof CreateCompanyParams, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreateCompanyParams = {
        name: form.name.trim(),
        website: form.website?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        location: form.location?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr.response?.data?.message;
      setSubmitError(
        Array.isArray(msg) ? msg[0] : msg ?? 'Something went wrong',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg focus:outline-none"
          aria-label={isEdit ? 'Edit company' : 'Add company'}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">
              {isEdit ? 'Edit company' : 'Add company'}
            </Dialog.Title>
            <Dialog.Close
              className="rounded-md p-1 hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="company-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Acme Corp"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company-website" className="text-sm font-medium">
                Website
              </label>
              <input
                id="company-website"
                type="url"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://acme.com"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="company-industry" className="text-sm font-medium">
                  Industry
                </label>
                <input
                  id="company-industry"
                  type="text"
                  value={form.industry}
                  onChange={(e) => update('industry', e.target.value)}
                  placeholder="Technology"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="company-location" className="text-sm font-medium">
                  Location
                </label>
                <input
                  id="company-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="San Francisco, CA"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company-notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="company-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Any notes about this company..."
                className={cn(inputClass, 'resize-none')}
              />
            </div>

            {(submitError || error) && (
              <p className="text-sm text-destructive" role="alert">
                {submitError ?? error ?? 'Something went wrong'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Dialog.Close
                type="button"
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting || !form.name.trim()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Save changes' : 'Add company'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
