import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTourLocations } from '@/features/tours/hooks/useTourLocations';
import type { TourSearchValues } from '@/features/tours/types';

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

const tourSearchSchema = z.object({
  keyword: z.string(),
  location: z.string(),
  departureDate: z.string(),
  budget: z.string(),
});

/**
 * TourSearchBar — search card that overlaps the hero on the List Tours page.
 * Uses shadcn Popover + Command to render a searchable location Combobox.
 */
export default function TourSearchBar({
  onSearch,
  initialValues,
  className = '',
}: TourSearchBarProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<TourSearchValues>({
    resolver: zodResolver(tourSearchSchema),
    defaultValues: {
      ...EMPTY_VALUES,
      ...initialValues,
    },
  });

  const [open, setOpen] = useState(false);
  const { locations } = useTourLocations();

  const keyword = watch('keyword');
  const location = watch('location');

  const initKeyword = initialValues?.keyword;
  const initLocation = initialValues?.location;
  const initDepartureDate = initialValues?.departureDate;
  const initBudget = initialValues?.budget;

  useEffect(() => {
    reset({
      ...EMPTY_VALUES,
      keyword: initKeyword || '',
      location: initLocation || '',
      departureDate: initDepartureDate || '',
      budget: initBudget || '',
    });
  }, [initKeyword, initLocation, initDepartureDate, initBudget, reset]);

  const onSubmit = (data: TourSearchValues) => {
    onSearch(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
                {...register('keyword')}
                placeholder="Bạn muốn tìm gì?"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </span>
          </div>
          {keyword && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setValue('keyword', '');
                onSearch({ ...watch(), keyword: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa từ khóa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="hidden h-10 w-px bg-border sm:block" />

        {/* Điểm đến (Combobox) */}
        <div className="flex flex-1 items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Điểm đến
              </span>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  type="button"
                  className="w-full text-left bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none flex justify-between items-center"
                >
                  <span
                    className={
                      location ? 'text-foreground' : 'text-muted-foreground/70 font-normal'
                    }
                  >
                    {location || 'Bạn muốn đi đâu?'}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Tìm địa danh..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy địa danh</CommandEmpty>
                      <CommandGroup>
                        {locations.map((loc) => (
                          <CommandItem
                            key={loc}
                            value={loc}
                            onSelect={() => {
                              setValue('location', loc);
                              setOpen(false);
                            }}
                          >
                            {loc}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </span>
          </div>
          {location && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setValue('location', '');
                onSearch({ ...watch(), location: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa điểm đến"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

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
