import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getBookTourPath, PATHS } from '@/constants';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import type { BookingFormState, TourDetail } from '../../types';

interface TourBookingCardProps {
  tour: TourDetail;
  className?: string;
}

/**
 * Sticky booking sidebar with date picker placeholder, guest selector, and price summary
 * Fixed on desktop, bottom sheet potential on mobile
 */
export function TourBookingCard({ tour, className }: TourBookingCardProps) {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);

  const [state, setState] = useState<BookingFormState>({
    selectedDate: null,
    participants: 1,
    totalPrice: 0,
  });

  // Parse price to number
  const pricePerPerson = useMemo(() => {
    const priceStr = tour.price.replace(/\D/g, '');
    return parseInt(priceStr, 10) || 0;
  }, [tour.price]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return pricePerPerson * state.participants;
  }, [pricePerPerson, state.participants]);

  const handleParticipantChange = useCallback(
    (delta: number) => {
      setState((prev) => ({
        ...prev,
        participants: Math.max(1, Math.min(prev.participants + delta, tour.maxParticipants)),
      }));
    },
    [tour.maxParticipants]
  );

  const handleDateSelect = useCallback((date: Date) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const handleBooking = useCallback(() => {
    if (!user) {
      navigate(PATHS.LOGIN);
      return;
    }
    const params = new URLSearchParams();
    params.set('participants', String(state.participants));
    if (state.selectedDate) {
      const dateStr = state.selectedDate.toISOString().split('T')[0];
      params.set('date', dateStr);
      params.set('scheduleId', `sched-${dateStr}`);
    }
    navigate(`${getBookTourPath(tour.id)}?${params.toString()}`);
  }, [user, navigate, tour.id, state.participants, state.selectedDate]);

  // Generate available dates (mock)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i * 2);
      // Skip some dates randomly for realism
      if (Math.random() > 0.3) {
        dates.push(date);
      }
    }
    return dates;
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    });
  };

  return (
    <aside
      className={cn('sticky top-24 rounded-2xl border border-border bg-card shadow-lg', className)}
      aria-label="Đặt tour"
    >
      {/* Header with price */}
      <div className="rounded-t-2xl border-b border-border bg-muted/30 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">{tour.price}</span>
            <span className="text-sm text-muted-foreground">/ người</span>
          </div>
          {tour.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{tour.originalPrice}</span>
          )}
        </div>

        {/* Rating quick view */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={`star-${tour.rating}`}
                className={cn(
                  'size-4',
                  i < Math.floor(tour.rating) ? 'text-yellow-500' : 'text-gray-300'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">{tour.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            ({tour.reviewCount.toLocaleString('vi-VN')})
          </span>
        </div>
      </div>

      {/* Booking form */}
      <div className="p-5 space-y-5">
        {/* Date selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Chọn ngày khởi hành
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.slice(0, 6).map((date) => {
              const isSelected = state.selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={`date-${date.toISOString()}`}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-center text-sm transition-colors',
                    'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground'
                  )}
                >
                  {formatDate(date)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Participants selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Số người tham gia
          </label>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <button
              type="button"
              onClick={() => handleParticipantChange(-1)}
              disabled={state.participants <= 1}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                state.participants <= 1 && 'cursor-not-allowed opacity-50'
              )}
              aria-label="Giảm số người"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <div className="text-center">
              <span className="text-xl font-bold">{state.participants}</span>
              <span className="ml-1 text-sm text-muted-foreground">người</span>
            </div>
            <button
              type="button"
              onClick={() => handleParticipantChange(1)}
              disabled={state.participants >= tour.maxParticipants}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                state.participants >= tour.maxParticipants && 'cursor-not-allowed opacity-50'
              )}
              aria-label="Tăng số người"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Tối đa {tour.maxParticipants} người</p>
        </div>

        {/* Price breakdown */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {tour.price} × {state.participants} người
            </span>
            <span className="font-medium">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        <Button
          onClick={handleBooking}
          className="h-12 w-full text-base font-semibold"
          variant="default"
        >
          <svg className="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Đặt ngay
        </Button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg
              className="size-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Thanh toán an toàn</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="size-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span>Hoàn tiền dễ dàng</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default TourBookingCard;
