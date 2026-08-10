import { Check, X } from 'lucide-react';
import { splitField } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';

interface TourInclusionsSectionProps {
  tour: TourDetailFromApi;
}

/**
 * "Bao gồm / Không bao gồm" — hai cột đối xứng.
 *
 * Trước đây `includes` chỉ hiện 4 mục đầu chen trong thẻ nhà cung cấp và `excludes`
 * nằm tách rời ở cuối trang; đặt cạnh nhau giúp so sánh trực tiếp.
 */
export function TourInclusionsSection({ tour }: TourInclusionsSectionProps) {
  const includes = splitField(tour.includes);
  const excludes = splitField(tour.excludes);

  if (includes.length === 0 && excludes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nhà tổ chức chưa liệt kê dịch vụ bao gồm cho tour này.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Giá tour bao gồm
        </h3>
        {includes.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Đang cập nhật.</p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Không bao gồm
        </h3>
        {excludes.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {excludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <X
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Đang cập nhật.</p>
        )}
      </div>
    </div>
  );
}
