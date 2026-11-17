import { Activity, Clock, Users } from 'lucide-react';
import MetricCard from '../MetricCard';

export default function MetricCardTrend() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <MetricCard
        label="Active users"
        value="1,284"
        delta={12.5}
        trend="up"
        hint="vs last week"
        icon={<Users size={14} />}
      />
      <MetricCard label="Bounce rate" value="38.2" unit="%" delta={-4.1} trend="down" icon={<Activity size={14} />} />
      <MetricCard label="P95 latency" value="184" unit="ms" hint="持平" icon={<Clock size={14} />} />
    </div>
  );
}
