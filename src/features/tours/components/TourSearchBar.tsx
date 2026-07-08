import { MapPin, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface TourSearchValues {
  /** Maps to the API `keyword` query param. */
  keyword: string;
  /** Maps to the API `location` query param. */
  location: string;
  /** Display-only date picker (backend doesn't accept a date param yet). */
  departureDate: string;
  /** Display-only budget hint (backend doesn't accept a price param yet). */
  budget: string;
}

interface TourSearchBarProps {
  onSearch: (values: TourSearchValues) => void;
  initialValues?: Partial<TourSearchValues>;
  className?: string;
}

const EMPTY_VALUES: TourSearchValues = {
  keyword: '',
  location: '',
  departureDate: '',
  budget: '',
};

/**
 * TourSearchBar — search card that overlaps the hero on the List Tours page.
 *
 * Composed of 4 columns (Từ khóa, Điểm đến, Ngày khởi hành, Ngân sách) plus
 * a primary "Tìm kiếm" button. The form is fully controlled by the parent
 * via `onSearch` — every submit pushes the current values up; the parent is
 * responsible for putting them into page state and triggering a refetch.
 */
export default function TourSearchBar({
  onSearch,
  initialValues,
  className = '',
}: TourSearchBarProps) {
  const [values, setValues] = useState<TourSearchValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  const initKeyword = initialValues?.keyword;
  const initLocation = initialValues?.location;

  useEffect(() => {
    setValues({
      ...EMPTY_VALUES,
      keyword: initKeyword || '',
      location: initLocation || '',
    });
  }, [initKeyword, initLocation]);

  const update = <K extends keyof TourSearchValues>(key: K, val: TourSearchValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative z-20 mx-auto -mt-20 w-full max-w-[1100px] rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 sm:-mt-24 sm:p-4 lg:p-3 ${className}`}
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0">
        {/* Từ khóa */}
        <label className="flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Từ khóa
              </span>
              <input
                type="text"
                value={values.keyword}
                onChange={(e) => update('keyword', e.target.value)}
                placeholder="Bạn muốn tìm gì?"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </span>
          </div>
          {values.keyword && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                update('keyword', '');
                // Also trigger search with cleared value
                onSearch({ ...values, keyword: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa từ khóa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="hidden h-10 w-px bg-border sm:block" />

        {/* Điểm đến */}
        <label className="flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Điểm đến
              </span>
              <input
                type="text"
                value={values.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Bạn muốn đi đâu?"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </span>
          </div>
          {values.location && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                update('location', '');
                // Also trigger search with cleared value
                onSearch({ ...values, location: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa điểm đến"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="hidden h-10 w-px bg-border sm:block" />

        {/* Ngày khởi hành */}
        {/* <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
              Ngày khởi hành
            </span>
            <input
              type="date"
              value={values.departureDate}
              onChange={(e) => update('departureDate', e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
            />
          </span>
        </label> */}

        <div className="hidden h-10 w-px bg-border sm:block" />

        {/* Ngân sách */}
        {/* <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
              Ngân sách
            </span>
            <select
              value={values.budget}
              onChange={(e) => update('budget', e.target.value)}
              className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-sm font-semibold text-foreground focus:outline-none"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </span>
        </label> */}

        {/* Submit */}
        <button
          type="submit"
          className="ml-auto inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg sm:ml-3 lg:px-6"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
          <span>Tìm kiếm</span>
        </button>
      </div>
    </form>
  );
}
