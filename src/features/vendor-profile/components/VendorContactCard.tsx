import { Mail, Phone } from 'lucide-react';
import type { VendorProfileDetail } from '../types';

interface VendorContactCardProps {
  profile: VendorProfileDetail;
}

/** Khối Thông tin liên hệ — Email + Số điện thoại. */
export function VendorContactCard({ profile }: VendorContactCardProps) {
  const items = [
    { icon: Mail, label: 'Email hỗ trợ', value: profile.contactEmail },
    { icon: Phone, label: 'Số điện thoại', value: profile.contactPhone || 'Chưa cập nhật' },
  ];

  return (
    <div className="rounded-[32px] p-6 sm:p-8" style={{ backgroundColor: '#F6F4EB' }}>
      <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
        Thông tin liên hệ
      </h3>

      <ul className="mt-5 space-y-4">
        {items.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#6F7B75' }}
              >
                {label}
              </p>
              <p className="truncate text-sm font-semibold" style={{ color: '#06261D' }}>
                {value}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
