import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EmptyIcon from '@/assets/icons/empty.svg?react';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardFooter,
  AppCardHeader,
  AppCardTitle,
  AppEmptyState,
  AppFormInput,
  AppIcon,
  AppSpinner,
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
} from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Đã thanh toán',
    totalAmount: '250.000 đ',
    paymentMethod: 'Thẻ tín dụng',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Chờ xử lý',
    totalAmount: '150.000 đ',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Chưa thanh toán',
    totalAmount: '350.000 đ',
    paymentMethod: 'Chuyển khoản ngân hàng',
  },
];

const formSchema = z.object({
  username: z.string().min(10, 'Tên đăng nhập phải có ít nhất 10 ký tự.'),
  email: z.string().email('Địa chỉ email không hợp lệ.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Dashboard() {
  const setLoading = useAppStore((state) => state.setLoading);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  const onSubmit = (data: FormValues) => {
    toast.success(`Đã gửi: ${data.username} - ${data.email}`);
  };

  const handleShowGlobalSpinner = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Đã tải xong!');
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trưng bày các Thành phần UI</h1>
        <p className="text-muted-foreground">
          Tổng quan đầy đủ về tất cả các thành phần giao diện dùng chung trong dự án TrekSphere.
        </p>
      </div>

      {/* 1. Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">1. Nút bấm (Buttons)</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppButton variant="default">Mặc định</AppButton>
          <AppButton variant="secondary">Phụ</AppButton>
          <AppButton variant="destructive">Nguy hiểm</AppButton>
          <AppButton variant="outline">Đường viền</AppButton>
          <AppButton variant="ghost">Trong suốt</AppButton>
          <AppButton variant="link">Liên kết</AppButton>
        </div>
      </section>

      {/* 2. Badges & Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          2. Nhãn (Badges) & Hiệu ứng tải tại chỗ
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppBadge variant="default">Mặc định</AppBadge>
          <AppBadge variant="secondary">Phụ</AppBadge>
          <AppBadge variant="destructive">Nguy hiểm</AppBadge>
          <AppBadge variant="outline">Đường viền</AppBadge>
          <div className="w-px h-6 bg-border mx-4"></div>
          <AppSpinner size="sm" />
          <AppSpinner size="default" className="text-primary" />
          <AppSpinner size="lg" className="text-destructive" />
        </div>
      </section>

      {/* 3. Global Loading Spinner */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">3. Hiệu ứng tải toàn màn hình</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppButton onClick={handleShowGlobalSpinner}>
            Kích hoạt Spinner toàn màn hình (2 giây)
          </AppButton>
          <p className="text-sm text-muted-foreground">Chặn tương tác trên toàn bộ màn hình.</p>
        </div>
      </section>

      {/* 4. Toasts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          4. Thông báo Toast (Thông báo hệ thống)
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppButton
            onClick={() => toast.success('Lưu dữ liệu thành công!')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Thành công
          </AppButton>
          <AppButton onClick={() => toast.error('Xóa mục thất bại.')} variant="destructive">
            Lỗi
          </AppButton>
          <AppButton
            onClick={() => toast.info('Có bản cập nhật mới.')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Thông tin
          </AppButton>
          <AppButton
            onClick={() => toast.warning('Phiên làm việc của bạn sắp hết hạn.')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Cảnh báo
          </AppButton>
        </div>
      </section>

      {/* 5. Form Elements & Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">5. Form Elements (Smart Input)</h2>
        <div className="max-w-sm">
          <AppCard>
            <AppCardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AppFormInput
                  name="username"
                  label="Tên đăng nhập"
                  placeholder="Nhập tên đăng nhập..."
                  control={control}
                  helperText="Form này sử dụng React Hook Form + Zod"
                />
                <AppFormInput
                  name="email"
                  label="Email"
                  placeholder="Nhập email..."
                  control={control}
                />
                <AppButton type="submit" className="w-full">
                  <AppIcon svg={EmptyIcon} className="mr-2 h-4 w-4" />
                  Gửi kèm Icon
                </AppButton>
              </form>
            </AppCardContent>
          </AppCard>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 6. Data Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">6. Bảng dữ liệu (Data Table)</h2>
          <AppCard>
            <AppCardHeader>
              <AppCardTitle>Hoá đơn gần đây</AppCardTitle>
            </AppCardHeader>
            <AppCardContent>
              <AppTable>
                <AppTableHeader>
                  <AppTableRow>
                    <AppTableHead className="w-[100px]">Hoá đơn</AppTableHead>
                    <AppTableHead>Trạng thái</AppTableHead>
                    <AppTableHead className="text-right">Số tiền</AppTableHead>
                  </AppTableRow>
                </AppTableHeader>
                <AppTableBody>
                  {invoices.map((invoice) => (
                    <AppTableRow key={invoice.invoice}>
                      <AppTableCell className="font-medium">{invoice.invoice}</AppTableCell>
                      <AppTableCell>{invoice.paymentStatus}</AppTableCell>
                      <AppTableCell className="text-right">{invoice.totalAmount}</AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTableBody>
              </AppTable>
            </AppCardContent>
          </AppCard>
        </section>

        {/* 7. Empty State */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">
            7. Trạng thái trống (Empty State)
          </h2>
          <AppCard className="h-full">
            <AppCardContent className="h-full flex items-center justify-center min-h-[300px]">
              <AppEmptyState
                title="Không tìm thấy chuyến đi"
                description="Bạn chưa tạo chuyến đi nào. Trạng thái trống giúp người dùng biết cần thực hiện bước tiếp theo thế nào."
              />
            </AppCardContent>
          </AppCard>
        </section>
      </div>

      {/* 8. Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">8. Thẻ thông tin (Cards)</h2>
        <div className="max-w-sm">
          <AppCard>
            <AppCardHeader>
              <AppCardTitle>Tiêu đề Thẻ</AppCardTitle>
              <AppCardDescription>
                Mô tả Thẻ hiển thị thông tin ngữ cảnh tương ứng.
              </AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
              <p className="text-sm text-muted-foreground">
                Nội dung phần thân của Thẻ. Khu vực này có thể chứa văn bản, hình ảnh hoặc các thành
                phần khác.
              </p>
            </AppCardContent>
            <AppCardFooter className="flex justify-between">
              <AppButton variant="outline">Hủy bỏ</AppButton>
              <AppButton>Xác nhận</AppButton>
            </AppCardFooter>
          </AppCard>
        </div>
      </section>
    </div>
  );
}
