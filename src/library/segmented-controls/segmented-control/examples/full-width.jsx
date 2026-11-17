import SegmentedControl from '../SegmentedControl';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
];

export default function SegmentedFullWidth() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 360 }}>
      <SegmentedControl options={OPTIONS} defaultValue="week" fullWidth />
      <SegmentedControl options={OPTIONS} defaultValue="day" size="lg" fullWidth />
      <SegmentedControl options={OPTIONS} defaultValue="month" size="sm" fullWidth />
    </div>
  );
}
