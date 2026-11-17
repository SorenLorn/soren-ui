import SegmentedControl from './SegmentedControl';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
];

/** 首页缩略展示：只呈现控件本身，不加任何说明文字 */
export default function SegmentedControlPreview() {
  return <SegmentedControl options={OPTIONS} defaultValue="week" size="sm" ariaLabel="Preview" />;
}
