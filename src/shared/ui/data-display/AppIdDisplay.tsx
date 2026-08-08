import { Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/store/useToastStore';

export interface AppIdDisplayProps {
  id: string;
  label?: string;
  maxLength?: number;
}

export const AppIdDisplay = ({ id, label, maxLength = 8 }: AppIdDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    toast.success('Đã sao chép ID');
  };

  return (
    <div className="flex items-center gap-1.5 inline-flex">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#EAE8E2] text-zinc-700 font-mono hover:bg-[#DCD9CF] transition-colors"
      >
        {label ? `${label}: ` : ''}
        {isExpanded ? id : `${id.substring(0, maxLength)}...`}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
        title="Sao chép ID"
      >
        <Copy className="size-3.5" />
      </button>
    </div>
  );
};
