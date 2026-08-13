import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDashboardStats, getRecentActivity } from '@/api/dashboard';
import { DashboardPage } from './DashboardPage';
import { renderWithProviders } from '@/test/utils';
import type { Application, DashboardStats } from '@/types';

vi.mock('@/api/dashboard', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/dashboard')>();
  return { ...actual, getDashboardStats: vi.fn(), getRecentActivity: vi.fn() };
});

const getStatsMock = vi.mocked(getDashboardStats);
const getRecentMock = vi.mocked(getRecentActivity);

const stats: DashboardStats = {
  totalApplications: 2,
  byStatus: {
    saved: 0,
    applying: 0,
    applied: 1,
    interview: 1,
    offer: 0,
    rejected: 0,
  },
  responseRate: 100,
};

const emptyStats: DashboardStats = {
  totalApplications: 0,
  byStatus: {
    saved: 0,
    applying: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  },
  responseRate: 0,
};

const application: Application = {
  id: 1,
  status: 'APPLIED',
  appliedDate: '2024-01-15T00:00:00.000Z',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2026-08-07T10:00:00.000Z',
  job: {
    id: 2,
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    salary: 180000,
    workType: 'HYBRID',
    status: 'APPLIED',
    dateFound: '2024-01-10T00:00:00.000Z',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
    company: {
      id: 2,
      name: 'Acme Corp',
      website: 'https://acme.com',
      industry: 'Technology',
      location: 'San Francisco, CA',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  },
};

const interviewApplication: Application = {
  ...application,
  id: 2,
  status: 'INTERVIEW',
  updatedAt: '2026-08-05T10:00:00.000Z',
  job: {
    ...application.job,
    id: 1,
    title: 'Full Stack Developer',
    company: {
      ...application.job.company!,
      id: 1,
      name: 'TechStart Inc',
    },
  },
};

function renderDashboard() {
  return renderWithProviders(<DashboardPage />, { route: '/dashboard' });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    getStatsMock.mockReset();
    getRecentMock.mockReset();
  });

  it('shows a loading state while the dashboard data is being fetched', () => {
    getStatsMock.mockImplementation(() => new Promise(() => {}));
    getRecentMock.mockImplementation(() => new Promise(() => {}));

    renderDashboard();

    expect(screen.getByRole('status', { name: 'Loading dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('renders the dashboard with live stats and recent activity', async () => {
    getStatsMock.mockResolvedValue(stats);
    getRecentMock.mockResolvedValue([application, interviewApplication]);

    renderDashboard();

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Total applications')).toBeInTheDocument();
    expect(screen.getByText('Response rate')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByText('Offers')).toBeInTheDocument();
    expect(screen.getByText('Rejections')).toBeInTheDocument();

    const breakdown = screen.getByRole('region', {
      name: 'Applications by status',
    });
    expect(within(breakdown).getByText('Applied')).toBeInTheDocument();
    expect(within(breakdown).getByText('Interview')).toBeInTheDocument();
    expect(within(breakdown).getByText('Saved')).toBeInTheDocument();

    const recent = screen.getByRole('region', { name: 'Recent activity' });
    expect(within(recent).getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(within(recent).getByText('Full Stack Developer')).toBeInTheDocument();
    expect(within(recent).getByText('Acme Corp')).toBeInTheDocument();
    expect(within(recent).getByText('TechStart Inc')).toBeInTheDocument();
  });

  it('shows an empty state when there are no applications', async () => {
    getStatsMock.mockResolvedValue(emptyStats);
    getRecentMock.mockResolvedValue([]);

    renderDashboard();

    expect(
      await screen.findByRole('heading', { name: 'No applications yet' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse jobs' })).toHaveAttribute(
      'href',
      '/jobs',
    );
    expect(screen.queryByText('Total applications')).not.toBeInTheDocument();
  });

  it('shows an error state with a retry when loading stats fails', async () => {
    getStatsMock.mockRejectedValueOnce({
      response: { data: { message: 'Failed to load dashboard data' } },
    });
    getRecentMock.mockResolvedValue([]);

    renderDashboard();

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to load dashboard data');
    expect(
      screen.getByRole('heading', { name: "Couldn't load your dashboard" }),
    ).toBeInTheDocument();

    getStatsMock.mockResolvedValueOnce(stats);
    getRecentMock.mockResolvedValue([application]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(getStatsMock).toHaveBeenCalledTimes(2);
  });

  it('shows an inline error in the recent activity section when only that request fails', async () => {
    getStatsMock.mockResolvedValue(stats);
    getRecentMock.mockRejectedValue({
      response: { data: { message: 'Could not fetch recent activity' } },
    });

    renderDashboard();

    const recent = await screen.findByRole('region', { name: 'Recent activity' });
    expect(await within(recent).findByRole('alert')).toHaveTextContent(
      'Could not fetch recent activity',
    );
    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it('shows an empty message inside recent activity when there are no recent items', async () => {
    getStatsMock.mockResolvedValue(stats);
    getRecentMock.mockResolvedValue([]);

    renderDashboard();

    const recent = await screen.findByRole('region', { name: 'Recent activity' });
    expect(within(recent).getByText('No recent activity yet.')).toBeInTheDocument();
  });
});
