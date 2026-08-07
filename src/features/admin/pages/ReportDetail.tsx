import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/store/useToastStore';
import { ReportDecisionPanel } from '../components/reports/ReportDecisionPanel';

import { ReportDetailHeader } from '../components/reports/ReportDetailHeader';
import { ReportTargetInfo } from '../components/reports/ReportTargetInfo';
import {
  adminReportService,
  type ReportAction,
  type ReportResponse,
} from '../services/adminReportService';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();

  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDecision, setSelectedDecision] = useState<ReportAction | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      adminReportService
        .getReportDetail(id)
        .then((res) => {
          setReportData(res);
          setIsSubmitted(res.status === 'RESOLVED' || res.status === 'DISMISSED');
        })
        // biome-ignore lint/suspicious/noExplicitAny: API error
        .catch((error: any) => {
          console.error(error);
          toast.error(
            error.message || error.response?.data?.message || 'Không thể tải chi tiết báo cáo'
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleSubmitDecision = async () => {
    if (!selectedDecision || !id) return;
    setIsSubmitting(true);
    try {
      await adminReportService.resolveReport(id, {
        action: selectedDecision,
        resolutionNotes: note,
      });

      setIsSubmitted(true);
      setReportData((prev) =>
        prev ? { ...prev, status: selectedDecision === 'DISMISS' ? 'DISMISSED' : 'RESOLVED' } : null
      );
      toast.success('Xử lý báo cáo thành công!');
      // biome-ignore lint/suspicious/noExplicitAny: API error
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || error.response?.data?.message || 'Có lỗi xảy ra khi xử lý báo cáo'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !reportData) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full size-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ReportDetailHeader id={reportData.id} status={reportData.status} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Content & Details (8 Cols) */}
        <div className="lg:col-span-8">
          <ReportTargetInfo
            reason={reportData.reason}
            reporterAvatar={reportData.reporterAvatar}
            reporterFullName={reportData.reporterFullName}
            reporterEmail={reportData.reporterEmail}
            createdAt={reportData.createdAt}
            targetType={reportData.targetType}
            targetId={reportData.targetId}
            targetTitle={reportData.targetTitle}
            targetContent={reportData.targetContent}
          />
        </div>

        {/* Right Column: Executive Decision Panel (4 Cols) */}
        <div className="lg:col-span-4">
          <ReportDecisionPanel
            isSubmitted={isSubmitted}
            selectedDecision={selectedDecision}
            note={note}
            isSubmitting={isSubmitting}
            onDecisionChange={setSelectedDecision}
            onNoteChange={setNote}
            onSubmit={handleSubmitDecision}
            onEditDecision={() => setIsSubmitted(false)}
          />
        </div>
      </div>
    </div>
  );
}
