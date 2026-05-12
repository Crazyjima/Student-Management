import { useEffect, useState, type ReactElement } from 'react';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { Input } from './Input';
import './SearchInput.css';

interface SearchInputProps {
  value: string;
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  ariaLabel?: string;
}

export const SearchInput = ({
  value: external,
  onDebouncedChange,
  placeholder = 'Search…',
  delay = 300,
  ariaLabel = 'Search',
}: SearchInputProps): ReactElement => {
  const [local, setLocal] = useState(external);
  const debounced = useDebouncedValue(local, delay);

  useEffect(() => {
    if (debounced !== external) {
      onDebouncedChange(debounced);
    }
  }, [debounced, external, onDebouncedChange]);

  useEffect(() => {
    setLocal(external);
  }, [external]);

  return (
    <div className="search-input">
      <svg className="search-input__icon" width="16" height="16" viewBox="0 0 24 24" />
      <Input
        type="search"
        className="search-input__field"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
        }}
      />
    </div>
  );
};
