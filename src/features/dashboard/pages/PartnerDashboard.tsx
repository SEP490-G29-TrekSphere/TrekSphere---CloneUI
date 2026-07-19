import { Briefcase, Calendar, Ticket } from 'lucide-react';
import {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardTitle,
} from '@/shared/ui';

export default function PartnerDashboard() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 p-4 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <Briefcase className="h-12 w-12 animate-pulse" />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Khu vực Đối tác (Partner)</h1>
        <p className="text-muted-foreground">
          Chào mừng bạn đến với trang quản trị dành cho Đối tác (Vendor Staff). Tính năng này hiện
          đang được phát triển và hoàn thiện.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        <AppCard>
          <AppCardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <AppCardTitle className="text-base">Quản lý Tour & Lịch trình</AppCardTitle>
          </AppCardHeader>
          <AppCardContent>
            <AppCardDescription>
              Tạo mới tour, thiết lập lịch khởi hành, giá bán và quản lý số lượng chỗ.
            </AppCardDescription>
          </AppCardContent>
        </AppCard>

        <AppCard>
          <AppCardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Ticket className="h-5 w-5 text-muted-foreground" />
            <AppCardTitle className="text-base">Mã giảm giá (Vouchers)</AppCardTitle>
          </AppCardHeader>
          <AppCardContent>
            <AppCardDescription>
              Tạo và quản lý các chương trình khuyến mãi, mã giảm giá để thu hút Trekker.
            </AppCardDescription>
          </AppCardContent>
        </AppCard>
      </div>
    </div>
  );
}
