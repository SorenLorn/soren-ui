import MetricCard from '../MetricCard';

export default function MetricCardBasic() {
  return (
    <div className="w-full max-w-[260px]">
      <MetricCard label="Monthly installs" value="12.4k" unit="次" delta={8.2} trend="up" hint="vs last month" />
    </div>
  );
}
