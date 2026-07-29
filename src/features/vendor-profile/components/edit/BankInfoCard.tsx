import { Landmark } from 'lucide-react';
import { VIETNAM_BANKS } from '../../constants';

interface BankInfoCardProps {
  bankName: string;
  onBankNameChange: (value: string) => void;
  bankAccount: string;
  onBankAccountChange: (value: string) => void;
}

const inputStyle = { backgroundColor: '#FFFFFF', border: '1px solid #E0DCD1', color: '#06261D' };
const labelStyle = { color: '#6F7B75' };

/** Khối "Thông tin ngân hàng" — tên ngân hàng (select) + số tài khoản. */
export function BankInfoCard({
  bankName,
  onBankNameChange,
  bankAccount,
  onBankAccountChange,
}: BankInfoCardProps) {
  return (
    <div className="rounded-[32px] p-6 sm:p-8" style={{ backgroundColor: '#F6F4EB' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
        >
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Thông tin ngân hàng
          </h3>
          <p className="text-xs" style={{ color: '#6F7B75' }}>
            Tài khoản nhận thanh toán từ hệ thống
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="bankName"
          >
            Tên ngân hàng
          </label>
          <select
            id="bankName"
            value={bankName}
            onChange={(e) => onBankNameChange(e.target.value)}
            className="h-11 w-full rounded-xl px-4 text-sm font-medium outline-none"
            style={inputStyle}
          >
            <option value="">-- Chọn ngân hàng --</option>
            {VIETNAM_BANKS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
            {bankName && !VIETNAM_BANKS.includes(bankName) && (
              <option value={bankName}>{bankName}</option>
            )}
          </select>
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="bankAccount"
          >
            Số tài khoản
          </label>
          <input
            id="bankAccount"
            type="text"
            value={bankAccount}
            onChange={(e) => onBankAccountChange(e.target.value)}
            placeholder="101234567890"
            className="h-11 w-full rounded-xl px-4 text-sm font-medium outline-none"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
