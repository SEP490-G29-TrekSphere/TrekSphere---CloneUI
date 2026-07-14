import { ChevronDown, Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ACCOUNT_FILTER_OPTIONS, type AccountRole } from '../types';

interface AccountFilterDropdownProps {
  value: AccountRole | 'ALL';
  onChange: (value: AccountRole | 'ALL') => void;
}

const LABEL_BY_VALUE: Record<AccountRole | 'ALL', string> = ACCOUNT_FILTER_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<AccountRole | 'ALL', string>
);

/**
 * Dropdown filter "Lọc theo loại tài khoản: <giá trị>".
 * - Nền trắng, bo góc tròn, viền mỏng, có icon bộ lọc và mũi tên drop-down.
 */
export function AccountFilterDropdown({ value, onChange }: AccountFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = LABEL_BY_VALUE[value] ?? 'Tất cả';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#06261D',
          border: '1px solid #E6E2D1',
        }}
      >
        <Filter className="h-4 w-4" style={{ color: '#6F7B75' }} />
        <span>
          Lọc theo loại tài khoản: <span className="font-semibold">{label}</span>
        </span>
        <ChevronDown className="h-4 w-4" style={{ color: '#6F7B75' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl py-1 shadow-lg"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
        >
          {ACCOUNT_FILTER_OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                style={{
                  color: isSelected ? '#06261D' : '#6F7B75',
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#06261D' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
