import { useState } from 'react';
import SegmentedControl from '../SegmentedControl';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
];

export default function SegmentedBasic() {
  const [range, setRange] = useState('week');

  return (
    <SegmentedControl options={OPTIONS} value={range} onChange={setRange} />
  );
}
