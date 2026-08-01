import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { VendorApplicationDetail } from '@/features/admin/services/vendorApplicationService';
import { AppFormInput } from '@/shared/ui';
import { AppLabel } from '@/shared/ui/primitives/AppLabel';

const applicationSchema = z.object({
  companyName: z.string().min(1, 'Vui lòng nhập tên công ty'),
  contactEmail: z
    .string()
    .min(1, 'Vui lòng nhập email liên hệ')
    .email('Email không đúng định dạng'),
  contactPhone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ'),
  businessDescription: z.string().optional(),
  taxCode: z.string().min(1, 'Vui lòng nhập mã số thuế'),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onSubmit: (formData: FormData) => void;
  initialData?: VendorApplicationDetail;
}

export function CreateApplicationDialog({
  open,
  onOpenChange,
  isPending = false,
  onSubmit,
  initialData,
}: CreateApplicationDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      businessDescription: '',
      taxCode: '',
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      reset({
        companyName: initialData?.companyName || '',
        contactEmail: initialData?.contactEmail || '',
        contactPhone: initialData?.contactPhone || '',
        businessDescription: initialData?.businessDescription || '',
        taxCode: initialData?.taxCode || '',
      });
      setLicenseFile(null);
      setLicenseError(null);
    }
  }, [open, initialData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Validate file size (e.g. max 10MB) or type
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setLicenseError('File vượt quá dung lượng tối đa 10MB.');
      return;
    }

    setLicenseError(null);
    setLicenseFile(file);
  };

  const submit = handleSubmit((values) => {
    if (!licenseFile && !initialData?.businessLicenseUrl) {
      setLicenseError('Vui lòng tải lên giấy phép kinh doanh');
      return;
    }

    const formData = new FormData();
    formData.append('companyName', values.companyName);
    formData.append('contactEmail', values.contactEmail);
    formData.append('contactPhone', values.contactPhone);
    formData.append('taxCode', values.taxCode);
    if (values.businessDescription) {
      formData.append('businessDescription', values.businessDescription);
    }
    if (licenseFile) {
      formData.append('businessLicense', licenseFile);
    }

    onSubmit(formData);
  });

  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 border-[#E5E4DE] shadow-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-primary">
            {isEditMode ? 'Cập nhật đơn đăng ký Vendor' : 'Đăng ký làm Vendor (Bản nháp)'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Chỉnh sửa thông tin hồ sơ đơn đăng ký của bạn.'
              : 'Khởi tạo đơn đăng ký của bạn. Bạn có thể lưu bản nháp và cập nhật thêm sau.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 py-2">
          <AppFormInput
            name="companyName"
            control={control}
            label="Tên công ty *"
            placeholder="Nhập tên doanh nghiệp/công ty"
            className="text-sm"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppFormInput
              name="contactEmail"
              control={control}
              label="Email liên hệ *"
              placeholder="email@company.com"
              type="email"
              className="text-sm"
            />
            <AppFormInput
              name="contactPhone"
              control={control}
              label="Số điện thoại *"
              placeholder="0901234567"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppFormInput
              name="taxCode"
              control={control}
              label="Mã số thuế *"
              placeholder="Nhập mã số thuế"
              className="text-sm"
            />

            <div className="space-y-2">
              <AppLabel className={licenseError ? 'text-destructive' : ''}>
                Giấy phép kinh doanh *
              </AppLabel>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[#E5E4DE] hover:bg-[#FAF9F5] text-zinc-700 flex items-center gap-2 w-full justify-center h-10 rounded-xl font-medium"
                >
                  <Upload className="h-4 w-4" />
                  Chọn tệp tài liệu
                </Button>
              </div>
              {licenseFile ? (
                <div className="flex items-center justify-between p-2.5 bg-[#FAF9F5] border border-[#E5E4DE] rounded-xl text-xs text-zinc-700 font-medium">
                  <span className="truncate max-w-[240px]">{licenseFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setLicenseFile(null)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : initialData?.businessLicenseUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-[#FAF9F5] border border-[#E5E4DE] rounded-xl text-xs text-zinc-700 font-medium">
                  <a
                    href={initialData.businessLicenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate max-w-[200px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5 inline" />
                    Giấy phép hiện tại
                  </a>
                  <span className="text-zinc-400 text-[10px]">Đã tải lên</span>
                </div>
              ) : null}
              {licenseError && <p className="text-xs text-destructive">{licenseError}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <AppLabel htmlFor="businessDescription">Mô tả kinh doanh</AppLabel>
            <Textarea
              id="businessDescription"
              placeholder="Mô tả tóm tắt về loại hình kinh doanh, dịch vụ..."
              className="bg-white border-[#E5E4DE] rounded-xl text-sm"
              rows={3}
              {...control.register('businessDescription')}
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl font-bold text-zinc-600 hover:bg-zinc-100"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#0B3025] text-white hover:bg-[#08221a] rounded-xl font-bold px-6"
            >
              {isPending ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo bản nháp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
