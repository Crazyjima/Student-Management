import { useState, type ComponentPropsWithoutRef, type ReactElement, type Ref } from 'react';
import { Input } from './Input';
import './PasswordInput.css';

interface PasswordInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

const EyeIcon = (): ReactElement => <svg width="16" height="16" viewBox="0 0 24 24" />;
const EyeOffIcon = (): ReactElement => <svg width="16" height="16" viewBox="0 0 24 24" />;

export const PasswordInput = ({
  className,
  invalid = false,
  ref,
  ...rest
}: PasswordInputProps): ReactElement => {
  const [visible, setVisible] = useState(false);

  const inputClass = ['password-input__input'];
  if (className !== undefined) {
    inputClass.push(className);
  }

  return (
    <div className="password-input">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        invalid={invalid}
        className={inputClass.join(' ')}
        {...rest}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => {
          setVisible((v) => !v);
        }}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};
