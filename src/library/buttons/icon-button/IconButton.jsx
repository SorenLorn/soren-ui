import './IconButton.css';

/** 纯图标按钮：必须提供 label 作为无障碍名称 */
export default function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  active = false,
  disabled = false,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      className={`sicon sicon--${variant} sicon--${size}${active ? ' is-active' : ''}`}
      {...rest}
    >
      <span className="sicon__glyph" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
