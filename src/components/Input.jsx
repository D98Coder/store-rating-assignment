import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, id, icon: Icon, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && <Icon size={16} className="input-icon" />}
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${Icon ? 'with-icon' : ''}`}
          {...rest}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {!error && hint && <p className="form-hint">{hint}</p>}
    </div>
  );
});

export default Input;