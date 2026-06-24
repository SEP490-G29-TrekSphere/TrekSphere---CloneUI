import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EmptyIcon from '@/assets/icons/empty.svg?react';
import { AppBadge } from '@/shared/ui/AppBadge';
import { AppButton } from '@/shared/ui/AppButton';
import {
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardFooter,
  AppCardHeader,
  AppCardTitle,
} from '@/shared/ui/AppCard';
import { AppEmptyState } from '@/shared/ui/AppEmptyState';
import { AppFormInput } from '@/shared/ui/AppFormInput';
import { AppIcon } from '@/shared/ui/AppIcon';
import { AppSpinner } from '@/shared/ui/AppSpinner';
import {
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
} from '@/shared/ui/AppTable';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  { invoice: 'INV002', paymentStatus: 'Pending', totalAmount: '$150.00', paymentMethod: 'PayPal' },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    paymentMethod: 'Bank Transfer',
  },
];

const formSchema = z.object({
  username: z.string().min(10, 'Username must be at least 10 characters.'),
  email: z.string().email('Invalid email address.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Dashboard() {
  const setLoading = useAppStore((state) => state.setLoading);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  const onSubmit = (data: FormValues) => {
    toast.success(`Submitted: ${data.username} - ${data.email}`);
  };

  const handleShowGlobalSpinner = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Finished loading!');
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">UI Components Showcase</h1>
        <p className="text-muted-foreground">
          A complete overview of all shared components in the TrekSphere project.
        </p>
      </div>

      {/* 1. Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">1. Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppButton variant="default">Default</AppButton>
          <AppButton variant="secondary">Secondary</AppButton>
          <AppButton variant="destructive">Destructive</AppButton>
          <AppButton variant="outline">Outline</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="link">Link</AppButton>
        </div>
      </section>

      {/* 2. Badges & Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">2. Badges & Local Spinners</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppBadge variant="default">Default</AppBadge>
          <AppBadge variant="secondary">Secondary</AppBadge>
          <AppBadge variant="destructive">Destructive</AppBadge>
          <AppBadge variant="outline">Outline</AppBadge>
          <div className="w-px h-6 bg-border mx-4"></div>
          <AppSpinner size="sm" />
          <AppSpinner size="default" className="text-primary" />
          <AppSpinner size="lg" className="text-destructive" />
        </div>
      </section>

      {/* 3. Global Loading Spinner */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">3. Global Loading Spinner</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppButton onClick={handleShowGlobalSpinner}>Trigger Global Spinner (2s)</AppButton>
          <p className="text-sm text-muted-foreground">Blocks the entire screen.</p>
        </div>
      </section>

      {/* 4. Toasts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">4. Toasts (Global Notifications)</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <AppButton
            onClick={() => toast.success('Data saved successfully!')}
            className="bg-green-600 hover:bg-green-700"
          >
            Success
          </AppButton>
          <AppButton onClick={() => toast.error('Failed to delete item.')} variant="destructive">
            Error
          </AppButton>
          <AppButton
            onClick={() => toast.info('New update available.')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Info
          </AppButton>
          <AppButton
            onClick={() => toast.warning('Your session will expire soon.')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Warning
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
                  label="Username"
                  placeholder="Enter username..."
                  control={control}
                  helperText="This uses React Hook Form + Zod"
                />
                <AppFormInput
                  name="email"
                  label="Email"
                  placeholder="Enter email..."
                  control={control}
                />
                <AppButton type="submit" className="w-full">
                  <AppIcon svg={EmptyIcon} className="mr-2 h-4 w-4" />
                  Submit with Icon
                </AppButton>
              </form>
            </AppCardContent>
          </AppCard>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 6. Data Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">6. Data Table</h2>
          <AppCard>
            <AppCardHeader>
              <AppCardTitle>Recent Invoices</AppCardTitle>
            </AppCardHeader>
            <AppCardContent>
              <AppTable>
                <AppTableHeader>
                  <AppTableRow>
                    <AppTableHead className="w-[100px]">Invoice</AppTableHead>
                    <AppTableHead>Status</AppTableHead>
                    <AppTableHead className="text-right">Amount</AppTableHead>
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
          <h2 className="text-2xl font-semibold border-b pb-2">7. Empty State</h2>
          <AppCard className="h-full">
            <AppCardContent className="h-full flex items-center justify-center min-h-[300px]">
              <AppEmptyState
                title="No Trips Found"
                description="You haven't created any trips yet. Empty states help users know what to do next."
              />
            </AppCardContent>
          </AppCard>
        </section>
      </div>

      {/* 8. Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">8. Cards</h2>
        <div className="max-w-sm">
          <AppCard>
            <AppCardHeader>
              <AppCardTitle>Card Title</AppCardTitle>
              <AppCardDescription>
                Card Description showing contextual information.
              </AppCardDescription>
            </AppCardHeader>
            <AppCardContent>
              <p className="text-sm text-muted-foreground">
                Card Content body. This area can contain text, images, or other components.
              </p>
            </AppCardContent>
            <AppCardFooter className="flex justify-between">
              <AppButton variant="outline">Cancel</AppButton>
              <AppButton>Confirm</AppButton>
            </AppCardFooter>
          </AppCard>
        </div>
      </section>
    </div>
  );
}
