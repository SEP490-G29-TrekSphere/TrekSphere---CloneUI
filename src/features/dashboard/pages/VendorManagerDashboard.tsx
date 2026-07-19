import { LayoutDashboard, Lock, ShieldAlert } from 'lucide-react';
import {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardTitle,
} from '@/shared/ui';

export default function VendorManagerDashboard() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 p-4 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <LayoutDashboard className="h-12 w-12 animate-pulse" />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Khu vực Vendor Manager</h1>
        <p className="text-muted-foreground">
          Chào mừng bạn đến với trang quản trị dành cho Vendor Manager. Tính năng này hiện đang được
          phát triển và hoàn thiện.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        <AppCard>
          <AppCardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <AppCardTitle className="text-base">Duyệt thông tin Tour</AppCardTitle>
          </AppCardHeader>
          <AppCardContent>
            <AppCardDescription>
              Quản lý và xét duyệt các tour từ đối tác trước khi hiển thị cho Trekker.
            </AppCardDescription>
          </AppCardContent>
        </AppCard>

        <AppCard>
          <AppCardHeader className="flex flex-row items-center space-x-2 pb-2">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
            <AppCardTitle className="text-base">Quản lý Đối tác</AppCardTitle>
          </AppCardHeader>
          <AppCardContent>
            <AppCardDescription>
              Xem danh sách và trạng thái hoạt động của các đối tác lữ hành trên hệ thống.
            </AppCardDescription>
          </AppCardContent>
        </AppCard>
      </div>
    </div>
  );
}
