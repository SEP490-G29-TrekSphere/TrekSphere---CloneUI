export interface ReportStatCardsProps {
  totalElements: number;
}

export function ReportStatCards({ totalElements }: ReportStatCardsProps) {
  return (
    <div className="w-full">
      {/* Total Reports Today */}
      <div className="bg-[#0B3025] text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-300/80">
            TỔNG SỐ BÁO CÁO HÔM NAY
          </span>
          <div className="text-5xl font-black tracking-tight mt-2 text-white">{totalElements}</div>
        </div>
      </div>
    </div>
  );
}
