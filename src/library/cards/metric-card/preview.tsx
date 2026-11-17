import { Activity } from 'lucide-react';
import MetricCard from './MetricCard';

/** 首页缩略展示：只呈现卡片本身 */
export default function MetricCardPreview() {
  return (
    <div className="w-full max-w-[210px]">
      <MetricCard
        label="Monthly installs"
        value="12.4k"
        delta={8.2}
        trend="up"
        hint="vs last month"
        icon={<Activity size={14} />}
      />
    </div>
  );
}
