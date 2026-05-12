import type { ReactElement, ReactNode } from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = ({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
}: FormFieldProps): ReactElement => {
  const errorId = error !== undefined ? `${htmlFor}-error` : undefined;
  const hintId = hint !== undefined && error === undefined ? `${htmlFor}-hint` : undefined;

  const classes: string[] = ['form-field'];
  if (error !== undefined) {
    classes.push('form-field--error');
  }

  return (
    <div className={classes.join(' ')}>
      <label htmlFor={htmlFor} className="form-field__label">
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            {' *'}
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {hintId !== undefined && hint !== undefined && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}
      {errorId !== undefined && error !== undefined && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
