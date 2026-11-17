import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconRight = null,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`sbtn sbtn--${variant} sbtn--${size}${fullWidth ? ' sbtn--block' : ''}${loading ? ' is-loading' : ''}`}
      {...rest}
    >
      {loading ? (
        <span className="sbtn__spinner" aria-hidden="true" />
      ) : (
        icon && <span className="sbtn__icon">{icon}</span>
      )}
      <span className="sbtn__label">{children}</span>
      {iconRight && !loading && <span className="sbtn__icon">{iconRight}</span>}
    </button>
  );
}
