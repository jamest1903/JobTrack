import { Award, CalendarCheck, FileText, Percent, XCircle } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  const { totalApplications, responseRate, byStatus } = stats;

  const cards = [
    { label: 'Total applications', value: totalApplications, icon: FileText },
    { label: 'Response rate', value: `${responseRate}%`, icon: Percent },
    { label: 'Interviews', value: byStatus.interview, icon: CalendarCheck },
    { label: 'Offers', value: byStatus.offer, icon: Award },
    { label: 'Rejections', value: byStatus.rejected, icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
