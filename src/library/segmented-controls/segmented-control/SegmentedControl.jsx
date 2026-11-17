import { useId, useState } from 'react';
import './SegmentedControl.css';

/**
 * 分段控件：受控 / 非受控皆可
 * @param {{ value: string, label: string, icon?: React.ReactNode }[]} options
 */
export default function SegmentedControl({
  options = [],
  value,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  ariaLabel = 'Segmented control'
}) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? options[0]?.value);
  const currentValue = value ?? innerValue;
  const baseId = useId();

  const count = options.length || 1;
  const activeIndex = Math.max(
    0,
    options.findIndex(option => option.value === currentValue)
  );

  const handleSelect = nextValue => {
    if (value === undefined) setInnerValue(nextValue);
    onChange?.(nextValue);
  };

  return (
    <div
      className={`segmented segmented--${size}${fullWidth ? ' segmented--block' : ''}`}
      role="tablist"
      aria-label={ariaLabel}
      style={{ '--seg-count': count, '--seg-index': activeIndex }}
    >
      <span className="segmented__thumb" aria-hidden="true" />

      {options.map((option, index) => {
        const selected = option.value === currentValue;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            id={`${baseId}-${index}`}
            aria-selected={selected}
            className={`segmented__item${selected ? ' is-active' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            {option.icon && <span className="segmented__icon">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
