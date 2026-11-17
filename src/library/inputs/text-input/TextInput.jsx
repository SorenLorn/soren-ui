import { useId } from 'react';
import './TextInput.css';

export default function TextInput({
  label,
  hint,
  error,
  size = 'md',
  leading = null,
  trailing = null,
  id,
  disabled = false,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={`sinput sinput--${size}${disabled ? ' is-disabled' : ''}${error ? ' is-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="sinput__label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="sinput__field">
        {leading && <span className="sinput__affix">{leading}</span>}
        <input
          id={inputId}
          className="sinput__control"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          {...rest}
        />
        {trailing && <span className="sinput__affix">{trailing}</span>}
      </div>

      {error && (
        <p className="sinput__message sinput__message--error" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="sinput__message" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
