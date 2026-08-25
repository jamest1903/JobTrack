import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '@/api/companies';
import { CompaniesPage } from './CompaniesPage';
import { renderWithProviders } from '@/test/utils';
import type { Company } from '@/types';

vi.mock('@/api/companies', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/companies')>();
  return {
    ...actual,
    getCompanies: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
    deleteCompany: vi.fn(),
  };
});

const getCompaniesMock = vi.mocked(getCompanies);
const createCompanyMock = vi.mocked(createCompany);
const updateCompanyMock = vi.mocked(updateCompany);
const deleteCompanyMock = vi.mocked(deleteCompany);

const companies: Company[] = [
  {
    id: 1,
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    location: 'San Francisco, CA',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'TechStart Inc',
    industry: 'AI',
    location: 'New York, NY',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'GreenLeaf',
    website: 'https://greenleaf.co',
    industry: 'Agriculture',
    location: 'Portland, OR',
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
  },
];

const newCompany: Company = {
  id: 4,
  name: 'NewCo',
  website: 'https://newco.io',
  industry: 'Finance',
  location: 'Austin, TX',
  createdAt: '2024-04-01T00:00:00.000Z',
  updatedAt: '2024-04-01T00:00:00.000Z',
};

function renderCompanies() {
  return renderWithProviders(<CompaniesPage />, { route: '/companies' });
}

describe('CompaniesPage', () => {
  beforeEach(() => {
    getCompaniesMock.mockReset();
    createCompanyMock.mockReset();
    updateCompanyMock.mockReset();
    deleteCompanyMock.mockReset();
  });

  it('shows a loading state while companies are being fetched', () => {
    getCompaniesMock.mockImplementation(() => new Promise(() => {}));

    renderCompanies();

    expect(screen.getByRole('status', { name: 'Loading companies' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Companies' })).not.toBeInTheDocument();
  });

  it('renders the companies list', async () => {
    getCompaniesMock.mockResolvedValue(companies);

    renderCompanies();

    expect(await screen.findByRole('heading', { name: 'Companies' })).toBeInTheDocument();
    expect(screen.getByText('3 companies')).toBeInTheDocument();
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TechStart Inc').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GreenLeaf').length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no companies', async () => {
    getCompaniesMock.mockResolvedValue([]);

    renderCompanies();

    expect(
      await screen.findByRole('heading', { name: 'No companies yet' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Add company')).toBeInTheDocument();
  });

  it('shows an error state with a retry when loading fails', async () => {
    getCompaniesMock.mockRejectedValueOnce({
      response: { data: { message: 'Failed to load companies' } },
    });

    renderCompanies();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to load companies',
    );
    expect(
      screen.getByRole('heading', { name: "Couldn't load companies" }),
    ).toBeInTheDocument();

    getCompaniesMock.mockResolvedValueOnce(companies);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Companies' })).toBeInTheDocument();
    expect(getCompaniesMock).toHaveBeenCalledTimes(2);
  });

  it('filters companies by name', async () => {
    getCompaniesMock.mockResolvedValue(companies);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const searchInput = screen.getByRole('textbox', { name: 'Search companies' });
    const user = userEvent.setup();
    await user.type(searchInput, 'Acme');

    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
    expect(screen.queryByText('TechStart Inc')).not.toBeInTheDocument();
    expect(screen.queryByText('GreenLeaf')).not.toBeInTheDocument();
  });

  it('filters companies by industry', async () => {
    getCompaniesMock.mockResolvedValue(companies);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const searchInput = screen.getByRole('textbox', { name: 'Search companies' });
    const user = userEvent.setup();
    await user.type(searchInput, 'Agriculture');

    expect(screen.getAllByText('GreenLeaf').length).toBeGreaterThan(0);
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('shows a message when no companies match the search', async () => {
    getCompaniesMock.mockResolvedValue(companies);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const searchInput = screen.getByRole('textbox', { name: 'Search companies' });
    const user = userEvent.setup();
    await user.type(searchInput, 'zzz');

    expect(screen.getByText('No companies match your search.')).toBeInTheDocument();
  });

  it('opens the create dialog and creates a new company', async () => {
    getCompaniesMock.mockResolvedValue(companies);
    createCompanyMock.mockResolvedValue(newCompany);
    getCompaniesMock.mockResolvedValueOnce(companies).mockResolvedValueOnce([...companies, newCompany]);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Add company/ }));

    const dialog = screen.getByRole('dialog', { name: 'Add company' });
    expect(dialog).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Name/), 'NewCo');
    await user.type(screen.getByLabelText('Website'), 'https://newco.io');
    await user.type(screen.getByLabelText('Industry'), 'Finance');
    await user.type(screen.getByLabelText('Location'), 'Austin, TX');

    await user.click(within(dialog).getByRole('button', { name: 'Add company' }));

    expect(createCompanyMock).toHaveBeenCalledWith({
      name: 'NewCo',
      website: 'https://newco.io',
      industry: 'Finance',
      location: 'Austin, TX',
      notes: undefined,
    });
  });

  it('opens the edit dialog and updates a company', async () => {
    const updatedCompany = { ...companies[0], name: 'Acme Updated' };
    getCompaniesMock
      .mockResolvedValueOnce(companies)
      .mockResolvedValueOnce(companies.map((c) => (c.id === 1 ? updatedCompany : c)));
    updateCompanyMock.mockResolvedValue(updatedCompany);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const user = userEvent.setup();
    const editButtons = screen.getAllByRole('button', { name: 'Edit Acme Corp' });
    await user.click(editButtons[0]);

    const dialog = screen.getByRole('dialog', { name: 'Edit company' });
    expect(dialog).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/^Name/);
    expect(nameInput).toHaveValue('Acme Corp');

    await user.clear(nameInput);
    await user.type(nameInput, 'Acme Updated');

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(updateCompanyMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Acme Updated' }),
    );
  });

  it('deletes a company after confirmation', async () => {
    getCompaniesMock
      .mockResolvedValueOnce(companies)
      .mockResolvedValueOnce(companies.filter((c) => c.id !== 1));
    deleteCompanyMock.mockResolvedValue(companies[0]);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete Acme Corp' });
    await user.click(deleteButtons[0]);

    const confirmDialog = screen.getByRole('dialog', { name: 'Delete company' });
    expect(confirmDialog).toBeInTheDocument();
    expect(within(confirmDialog).getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(within(confirmDialog).getByText('Acme Corp')).toBeInTheDocument();

    await user.click(within(confirmDialog).getByRole('button', { name: 'Delete' }));

    expect(deleteCompanyMock).toHaveBeenCalledWith(1);
  });

  it('shows the website link when a company has a website', async () => {
    getCompaniesMock.mockResolvedValue([companies[0]]);

    renderCompanies();

    await screen.findByRole('heading', { name: 'Companies' });

    const links = screen.getAllByRole('link', { name: 'Visit Acme Corp website' });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', 'https://acme.com');
    expect(links[0]).toHaveAttribute('target', '_blank');
  });

  it('shows em dash for missing optional fields', async () => {
    getCompaniesMock.mockResolvedValue([
      { id: 99, name: 'Minimal Co', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    ]);

    renderCompanies();

    const rows = await screen.findAllByText('Minimal Co');
    expect(rows.length).toBeGreaterThan(0);
  });
});
